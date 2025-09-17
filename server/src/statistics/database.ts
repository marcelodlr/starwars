import { db } from '../database/init'
import type { Statement } from 'bun:sqlite'
import type { DatabaseStatistics, StatisticsInsert } from './types'

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

export class StatisticsDatabase {
    static insertStatistics(stats: StatisticsInsert): void {
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

    static getLatestStatistics(): DatabaseStatistics | null {
        try {
            const result = StatisticsQueryManager.queries.selectLatestStatement.get()
            return result || null
        } catch (error) {
            console.error('Error getting latest statistics:', error)
            throw error
        }
    }

    static cleanupOldStatistics(daysToKeep: number = 7): number {
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
