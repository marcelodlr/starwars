import { Hono } from 'hono'
import movieRoutes from './movies/routes'
import peopleRoutes from './people/routes'
import statisticsRoutes from './statistics/routes'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { initializeDatabase } from './database'
import { DataSeeder } from './database/seeder'
import { requestInterceptor } from './middleware/requestInterceptor'
import { statisticsWorker } from './workers/statisticsWorker'

const app = new Hono()

app.use(logger())
app.use(cors())

app.use('/api/*', requestInterceptor)

app.get('/healthcheck', (c) => {
    return c.text('Up!')
})

// API routes first - these take precedence
app.route('/api/people', peopleRoutes)
app.route('/api/movies', movieRoutes)
app.route('/api/statistics', statisticsRoutes)

app.use('/assets/*', serveStatic({ root: './public' }))

app.use('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))

app.get('*', serveStatic({ path: './public/index.html' }))

async function startServer() {
    initializeDatabase();
    
    try {
        await DataSeeder.seedDatabase();
    } catch (error) {
        console.error('Failed to seed database:', error);
        console.log('Server will continue with API fallback');
    }
    
    // Start the statistics worker
    statisticsWorker.start();
    
    console.log('Server ready!');
}

(async () => {
    await startServer();
})().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...')
    statisticsWorker.stop()
    process.exit(0)
})

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...')
    statisticsWorker.stop()
    process.exit(0)
})

export default app

