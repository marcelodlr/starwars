import { db } from './init'
import type { Statement } from 'bun:sqlite'

export interface DatabaseStatistics {
    id: number
    top5_queries: string // JSON string
    total_requests: number
    popular_characters: string | null // JSON string
    popular_movies: string | null // JSON string
    computed_at: string // ISO string
    created_at: string
    updated_at: string
}

export interface StatisticsInsert {
    top5_queries: Array<{path: string, count: number}>
    total_requests: number
    popular_characters?: Array<{characterId: string, requestCount: number}>
    popular_movies?: Array<{movieId: string, requestCount: number}>
    computed_at: Date
}

export interface ComputedStatistics {
    top5_queries: Array<{path: string, count: number}>
    total_requests: number
    popular_characters: Array<{characterId: string, requestCount: number}>
    popular_movies: Array<{movieId: string, requestCount: number}>
    computed_at: Date
}

interface StatisticsQueries {
    insertStatement: Statement<void, [string, number, string | null, string | null, string]>
    selectLatestStatement: Statement<DatabaseStatistics, []>
    cleanupOldStatement: Statement<void, [string]>
}

class StatisticsQueryManager {
    private static instance: StatisticsQueries | null = null

    static get queries(): StatisticsQueries {
        if (!this.instance) {
            this.instance = {
                insertStatement: db.prepare(`
                    INSERT INTO statistics (top5_queries, total_requests, popular_characters, popular_movies, computed_at)
                    VALUES (?, ?, ?, ?, ?)
                `),
                selectLatestStatement: db.prepare(`
                    SELECT * FROM statistics 
                    ORDER BY computed_at DESC 
                    LIMIT 1
                `),
                cleanupOldStatement: db.prepare(`
                    DELETE FROM statistics 
                    WHERE computed_at < ? 
                    AND id NOT IN (
                        SELECT id FROM statistics 
                        ORDER BY computed_at DESC 
                        LIMIT 10
                    )
                `)
            }
        }
        return this.instance
    }
}

export class StatisticsTableService {
    
    insertStatistics(stats: StatisticsInsert): void {
        try {
            StatisticsQueryManager.queries.insertStatement.run(
                JSON.stringify(stats.top5_queries),
                stats.total_requests,
                stats.popular_characters ? JSON.stringify(stats.popular_characters) : null,
                stats.popular_movies ? JSON.stringify(stats.popular_movies) : null,
                stats.computed_at.toISOString()
            )
        } catch (error) {
            console.error('Error inserting statistics:', error)
            throw error
        }
    }


    getLatestStatistics(): ComputedStatistics | null {
        try {
            const result = StatisticsQueryManager.queries.selectLatestStatement.get()
            
            if (!result) {
                return null
            }

            return {
                top5_queries: JSON.parse(result.top5_queries),
                total_requests: result.total_requests,
                popular_characters: result.popular_characters ? JSON.parse(result.popular_characters) : [],
                popular_movies: result.popular_movies ? JSON.parse(result.popular_movies) : [],
                computed_at: new Date(result.computed_at)
            }
        } catch (error) {
            console.error('Error getting latest statistics:', error)
            throw error
        }
    }

    // Cleanup old statistics (keep last 10 records)
    cleanupOldStatistics(daysToKeep: number = 7): number {
        try {
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
            
            const result = StatisticsQueryManager.queries.cleanupOldStatement.run(cutoffDate.toISOString())
            return result.changes
        } catch (error) {
            console.error('Error cleaning up old statistics:', error)
            throw error
        }
    }
}

export const statisticsTableService = new StatisticsTableService()
