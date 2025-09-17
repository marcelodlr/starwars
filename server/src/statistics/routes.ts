import { Hono } from 'hono'
import { getLatestStatistics } from './service'
import { statisticsWorker } from '../workers/statisticsWorker'
import { requestEventsService } from '../database/requestEventsService'

const statisticsRoutes = new Hono()

// Get top 5 queries from precomputed statistics table
statisticsRoutes.get('/', (c) => {
    try {
        const stats = getLatestStatistics()
        
        if (!stats) {
            return c.json({
                message: 'No statistics available yet. Worker may still be computing initial data.',
                data: {
                    top5Queries: [],
                    totalRequests: 0,
                    lastUpdated: new Date()
                }
            })
        }
        
        return c.json({
            message: 'Star Wars Statistics',
            data: {
                lastUpdated: stats.computed_at,
            requestData: {
                top5Queries: stats.top5_queries,
                totalRequests: stats.total_requests,
            },
            contentData: {
                popularCharacters: stats.popular_characters,
                popularMovies: stats.popular_movies
            }
        }});
    } catch (error) {
        return c.json({
            message: 'Error retrieving statistics',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500)
    }
})
export default statisticsRoutes
