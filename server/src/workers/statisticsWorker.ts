import { requestEventsService } from '../database/requestEventsService'
import { statisticsTableService } from '../database/statisticsTableService'

class StatisticsWorker {
    private intervalId: NodeJS.Timeout | null = null
    private isRunning = false

    start() {
        if (this.isRunning) {
            console.log('Statistics worker is already running')
            return
        }

        console.log('Starting statistics worker...')
        this.isRunning = true

        this.intervalId = setInterval(() => {
            this.processStatistics()
        }, 5 * 60 * 1000)

        this.processStatistics()
        
        console.log('Statistics worker started - processing every 5 minutes')
    }

    stop() {
        if (!this.isRunning) {
            return
        }

        console.log('Stopping statistics worker...')
        
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
        
        this.isRunning = false
        console.log('Statistics worker stopped')
    }

    private processStatistics() {
        try {
            // Process any pending events in database
            this.processPendingEvents()
            
            // Compute and store statistics for both time windows
            this.computeAndStoreStatistics()

            // Log database event counts
            const eventCounts = requestEventsService.getEventCountsByStatus()
            console.log('Database event counts:', eventCounts)

            // Cleanup old events (keep last 30 days)
            const cleanedUp = requestEventsService.cleanupOldEvents(30)
            if (cleanedUp > 0) {
                console.log(`Cleaned up ${cleanedUp} old events`)
            }

            // Cleanup old statistics (keep last 7 days)
            const statsCleanedUp = statisticsTableService.cleanupOldStatistics(7)
            if (statsCleanedUp > 0) {
                console.log(`Cleaned up ${statsCleanedUp} old statistics records`)
            }
        } catch (error) {
            console.error('Error processing statistics:', error)
        }
    }

    private computeAndStoreStatistics() {
        try {
            const now = new Date()
            
            const allTimeStats = this.computeStatisticsForTimeWindow()
            
            statisticsTableService.insertStatistics({
                top5_queries: allTimeStats.top5Queries,
                total_requests: allTimeStats.totalRequests,
                popular_characters: allTimeStats.popularCharacters,
                popular_movies: allTimeStats.popularMovies,
                computed_at: now
            })
            
            console.log(`Statistics computed and stored at ${now.toISOString()}:`, {
                totalRequests: allTimeStats.totalRequests,
                top5Count: allTimeStats.top5Queries.length,
                popularCharactersCount: allTimeStats.popularCharacters.length,
                popularMoviesCount: allTimeStats.popularMovies.length
            })
        } catch (error) {
            console.error('Error computing and storing statistics:', error)
        }
    }

    private computeStatisticsForTimeWindow(): { 
        top5Queries: Array<{path: string, count: number}>, 
        totalRequests: number,
        popularCharacters: Array<{characterId: string, requestCount: number}>,
        popularMovies: Array<{movieId: string, requestCount: number}>
    } {
        try {
            const top5Queries = requestEventsService.getTop5Queries()
            
            const eventCounts = requestEventsService.getEventCountsByStatus()
            const totalRequests = eventCounts.processed || 0

            // Get popular characters and movies (top 3 each)
            const popularCharacters = requestEventsService.getMostPopularCharacters()
            const popularMovies = requestEventsService.getMostPopularMovies()

            return {
                top5Queries,
                totalRequests,
                popularCharacters,
                popularMovies
            }
        } catch (error) {
            console.error('Error computing statistics:', error)
            return {
                top5Queries: [],
                totalRequests: 0,
                popularCharacters: [],
                popularMovies: []
            }
        }
    }

    private processPendingEvents() {
        try {
            const pendingEvents = requestEventsService.getNonCompletedEvents()
            
            if (pendingEvents.length > 0) {
                console.log(`Found ${pendingEvents.length} pending events to process`)
                
                // Mark all pending events as processed since they're already in the database
                for (const dbEvent of pendingEvents) {
                    try {
                        requestEventsService.markEventProcessed(dbEvent.id)
                    } catch (error) {
                        console.error(`Failed to mark event ${dbEvent.id} as processed:`, error)
                    }
                }
                
                console.log(`Processed ${pendingEvents.length} pending events`)
            }
        } catch (error) {
            console.error('Error processing pending events:', error)
        }
    }

    isWorkerRunning(): boolean {
        return this.isRunning
    }
}

export const statisticsWorker = new StatisticsWorker()
