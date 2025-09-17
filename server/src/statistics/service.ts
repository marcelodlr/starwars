import { StatisticsDatabase } from './database'
import type { ComputedStatistics, StatisticsInsert } from './types'

export const insertStatistics = (stats: StatisticsInsert): void => {
    StatisticsDatabase.insertStatistics(stats)
}

export const getLatestStatistics = (): ComputedStatistics | null => {
    const result = StatisticsDatabase.getLatestStatistics()
    
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
}

export const cleanupOldStatistics = (daysToKeep: number = 7): number => {
    return StatisticsDatabase.cleanupOldStatistics(daysToKeep)
}

export default {
    insertStatistics,
    getLatestStatistics,
    cleanupOldStatistics
}
