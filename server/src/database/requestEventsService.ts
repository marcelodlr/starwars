import { db } from './init'
import type { Statement } from 'bun:sqlite'

export interface DatabaseRequestEvent {
    id: string
    method: string
    path: string
    timestamp: string // ISO string in database
    response_time?: number
    status_code?: number
    status: 'pending' | 'processed' | 'failed'
    created_at: string
    updated_at: string
}

export interface RequestEventInsert {
    id: string
    method: string
    path: string
    timestamp: Date
    response_time?: number
    status_code?: number
    status?: 'pending' | 'processed' | 'failed'
}

interface RequestEventQueries {
    insertStatement: Statement<void, [string, string, string, string, number | null, number | null, string]>
    updateStatusStatement: Statement<void, [string, string]>
    updateEventStatement: Statement<void, [number, number, string, string]>
    selectNonCompletedStatement: Statement<DatabaseRequestEvent, []>
    selectByStatusStatement: Statement<DatabaseRequestEvent, [string]>
    selectRecentEventsStatement: Statement<DatabaseRequestEvent, [string]>
    countByStatusStatement: Statement<{ status: string, count: number }, []>
    selectTop5QueriesStatement: Statement<{ path: string, count: number }, []>
    selectPopularCharactersStatement: Statement<{characterId: string, requestCount: number}, []>
    selectPopularMoviesStatement: Statement<{movieId: string, requestCount: number}, []>
}

class RequestEventQueryManager {
    private static instance: RequestEventQueries | null = null

    static get queries(): RequestEventQueries {
        if (!this.instance) {
            this.instance = {
                insertStatement: db.prepare(`
                    INSERT INTO request_events (
                        id, method, path, timestamp, response_time, status_code, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `),
                updateStatusStatement: db.prepare(`
                    UPDATE request_events 
                    SET status = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                `),
                updateEventStatement: db.prepare(`
                    UPDATE request_events 
                    SET response_time = ?, status_code = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                `),
                selectNonCompletedStatement: db.prepare(`
                    SELECT * FROM request_events 
                    WHERE status = 'pending' 
                    ORDER BY timestamp ASC
                `),
                selectByStatusStatement: db.prepare(`
                    SELECT * FROM request_events 
                    WHERE status = ? 
                    ORDER BY timestamp DESC
                `),
                selectRecentEventsStatement: db.prepare(`
                    SELECT * FROM request_events 
                    WHERE timestamp >= ? AND status = 'processed'
                    ORDER BY timestamp DESC
                `),
                countByStatusStatement: db.prepare(`
                    SELECT status, COUNT(*) as count 
                    FROM request_events 
                    GROUP BY status
                `),
                selectTop5QueriesStatement: db.prepare(`
                    SELECT path, COUNT(*) as count 
                    FROM request_events 
                    WHERE status = 'processed'
                    GROUP BY path 
                    ORDER BY count DESC 
                    LIMIT 5
                `),
                selectPopularCharactersStatement: db.prepare(`
                    SELECT 
                        SUBSTR(path, LENGTH('/api/people/') + 1) as characterId,
                        COUNT(*) as requestCount
                    FROM request_events 
                    WHERE status = 'processed' 
                    AND path LIKE '/api/people/%'
                    AND path NOT LIKE '/api/people/%/%'
                    GROUP BY characterId
                    ORDER BY requestCount DESC
                    LIMIT 3
                `),
                selectPopularMoviesStatement: db.prepare(`
                    SELECT 
                        SUBSTR(path, LENGTH('/api/movies/') + 1) as movieId,
                        COUNT(*) as requestCount
                    FROM request_events 
                    WHERE status = 'processed' 
                    AND path LIKE '/api/movies/%'
                    AND path NOT LIKE '/api/movies/%/%'
                    GROUP BY movieId
                    ORDER BY requestCount DESC
                    LIMIT 3
                `)
            }
        }
        return this.instance
    }
}

export class RequestEventsService {

    insertEvent(event: RequestEventInsert): void {
        try {
            RequestEventQueryManager.queries.insertStatement.run(
                event.id,
                event.method,
                event.path,
                event.timestamp.toISOString(),
                event.response_time || null,
                event.status_code || null,
                event.status || 'pending'
            )
        } catch (error) {
            console.error('Error inserting request event:', error)
            throw error
        }
    }

    updateEventStatus(id: string, status: 'pending' | 'processed' | 'failed'): void {
        try {
            RequestEventQueryManager.queries.updateStatusStatement.run(status, id)
        } catch (error) {
            console.error('Error updating event status:', error)
            throw error
        }
    }

    updateEventResponse(id: string, responseTime: number, statusCode: number): void {
        try {
            RequestEventQueryManager.queries.updateEventStatement.run(responseTime, statusCode, 'pending', id)
        } catch (error) {
            console.error('Error updating event response:', error)
            throw error
        }
    }

    updateEventComplete(id: string, responseTime: number, statusCode: number): void {
        try {
            RequestEventQueryManager.queries.updateEventStatement.run(responseTime, statusCode, 'completed', id)
        } catch (error) {
            console.error('Error updating event completion:', error)
            throw error
        }
    }

    updateEventFailed(id: string, responseTime: number): void {
        try {
            RequestEventQueryManager.queries.updateEventStatement.run(responseTime, 500, 'failed', id)
        } catch (error) {
            console.error('Error updating event failure:', error)
            throw error
        }
    }

    markEventProcessed(id: string): void {
        try {
            RequestEventQueryManager.queries.updateStatusStatement.run('processed', id)
        } catch (error) {
            console.error('Error marking event as processed:', error)
            throw error
        }
    }

    getNonCompletedEvents(): DatabaseRequestEvent[] {
        try {
            return RequestEventQueryManager.queries.selectNonCompletedStatement.all()
        } catch (error) {
            console.error('Error fetching non-completed events:', error)
            throw error
        }
    }

    getEventsByStatus(status: 'pending' | 'processed' | 'failed'): DatabaseRequestEvent[] {
        try {
            return RequestEventQueryManager.queries.selectByStatusStatement.all(status)
        } catch (error) {
            console.error('Error fetching events by status:', error)
            throw error
        }
    }

    getRecentCompletedEvents(since: Date): DatabaseRequestEvent[] {
        try {
            return RequestEventQueryManager.queries.selectRecentEventsStatement.all(since.toISOString())
        } catch (error) {
            console.error('Error fetching recent events:', error)
            throw error
        }
    }

    getEventCountsByStatus(): Record<string, number> {
        try {
            const results = RequestEventQueryManager.queries.countByStatusStatement.all()
            const counts: Record<string, number> = {}
            results.forEach(row => {
                counts[row.status] = row.count
            })
            return counts
        } catch (error) {
            console.error('Error fetching event counts:', error)
            throw error
        }
    }

    // Get top 5 most requested endpoints
    getTop5Queries(): Array<{path: string, count: number}> {
        try {
            return RequestEventQueryManager.queries.selectTop5QueriesStatement.all()
        } catch (error) {
            console.error('Error getting top 5 queries:', error)
            throw error
        }
    }

    // Get most popular characters (from /character/:id paths) - top 3
    getMostPopularCharacters(): Array<{characterId: string, requestCount: number}> {
        try {
            return RequestEventQueryManager.queries.selectPopularCharactersStatement.all()
        } catch (error) {
            console.error('Error getting most popular characters:', error)
            throw error
        }
    }

    // Get most popular movies (from /film/:id paths) - top 3
    getMostPopularMovies(): Array<{movieId: string, requestCount: number}> {
        try {
            return RequestEventQueryManager.queries.selectPopularMoviesStatement.all()
        } catch (error) {
            console.error('Error getting most popular movies:', error)
            throw error
        }
    }

    // Get character and movie statistics combined - top 3 each
    getContentPopularityStats(): {characters: Array<{characterId: string, requestCount: number}>, movies: Array<{movieId: string, requestCount: number}>} {
        try {
            const characters = this.getMostPopularCharacters()
            const movies = this.getMostPopularMovies()
            
            return {
                characters,
                movies
            }
        } catch (error) {
            console.error('Error getting content popularity stats:', error)
            return {
                characters: [],
                movies: []
            }
        }
    }

    // Debug method to check what paths are actually in the database
    getUniquePaths(): Array<{path: string, count: number}> {
        try {
            const query = `
                SELECT path, COUNT(*) as count 
                FROM request_events 
                WHERE status = 'processed'
                GROUP BY path 
                ORDER BY count DESC
            `
            const statement = db.prepare(query)
            return statement.all() as Array<{path: string, count: number}>
        } catch (error) {
            console.error('Error getting unique paths:', error)
            return []
        }
    }

    // Cleanup old events (keep last N days)
    cleanupOldEvents(daysToKeep: number = 30): number {
        try {
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
            
            const deleteStatement = db.prepare(`
                DELETE FROM request_events 
                WHERE timestamp < ? AND status = 'processed'
            `)
            
            const result = deleteStatement.run(cutoffDate.toISOString())
            return result.changes
        } catch (error) {
            console.error('Error cleaning up old events:', error)
            throw error
        }
    }
}

export const requestEventsService = new RequestEventsService()
