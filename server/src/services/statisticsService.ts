import { requestEventsService } from '../database/requestEventsService'

export interface RequestStatistics {
    top5Queries: Array<{path: string, count: number}>
    totalRequests: number
    lastUpdated: Date
    timeWindow: {
        start: Date
        end: Date
    }
}

class StatisticsService {
    private getEmptyStats(): RequestStatistics {
        const now = new Date()
        return {
            top5Queries: [],
            totalRequests: 0,
            lastUpdated: now,
            timeWindow: {
                start: new Date(now.getTime() - 5 * 60 * 1000),
                end: now
            }
        }
    }

    computeStatistics(timeWindow?: 'last5min' | 'alltime'): RequestStatistics {
        try {
            const now = new Date()
            let since: Date | undefined
            
            if (timeWindow === 'last5min') {
                since = new Date(now.getTime() - 5 * 60 * 1000)
            }
            
            const top5Queries = requestEventsService.getTop5Queries(since)
            
            let totalRequests = 0
            if (since) {
                const recentEvents = requestEventsService.getRecentCompletedEvents(since)
                totalRequests = recentEvents.length
            } else {
                const eventCounts = requestEventsService.getEventCountsByStatus()
                totalRequests = eventCounts.processed || 0
            }

            return {
                top5Queries,
                totalRequests,
                lastUpdated: now,
                timeWindow: {
                    start: since || new Date(0),
                    end: now
                }
            }
        } catch (error) {
            console.error('Error computing statistics from database:', error)
            return this.getEmptyStats()
        }
    }

    // Get database event status counts
    getDatabaseEventCounts(): Record<string, number> {
        try {
            return requestEventsService.getEventCountsByStatus()
        } catch (error) {
            console.error('Error getting database event counts:', error)
            return {}
        }
    }
}

export const statisticsService = new StatisticsService()
