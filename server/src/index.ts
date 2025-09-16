import { Hono } from 'hono'
import movieRoutes from './movies/routes'
import peopleRoutes from './people/routes'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { initializeDatabase } from './database'
import { DataSeeder } from './database/seeder'

const app = new Hono()

app.use(logger())
app.use(cors())

app.get('/healthcheck', (c) => {
    return c.text('Up!')
})

// API routes first - these take precedence
app.route('/api/people', peopleRoutes)
app.route('/api/movies', movieRoutes)

// Serve static assets (CSS, JS, images, etc.)
app.use('/assets/*', serveStatic({ root: './public' }))

// Serve favicon and other root-level static files
app.use('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))

// Catch-all route to serve index.html for client-side routing
app.get('*', serveStatic({ path: './public/index.html' }))

async function startServer() {
    initializeDatabase();
    
    try {
        await DataSeeder.seedDatabase();
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Failed to seed database:', error);
        console.log('Server will continue with API fallback');
    }
    
    console.log('Server ready!');
}

(async () => {
    await startServer();
})().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
export default app

