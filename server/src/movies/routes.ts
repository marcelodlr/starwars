import { Hono } from 'hono'
import { getMovie, searchMovies } from './service'
import { EntityNotFoundException } from '~/shared/exceptions'
import { HTTPException } from 'hono/http-exception'

const movieRoutes = new Hono()

movieRoutes.get('/', async (c) => {
    const query = c.req.query('query')
    const movies = await searchMovies(query)
    return c.json(movies)
})

movieRoutes.get('/:id', async (c) => {
    const id = c.req.param('id')
    try {
        const movie = await getMovie(id)
        return c.json(movie)
    } catch (error) {
        if (error instanceof EntityNotFoundException) {
            throw new HTTPException(404, { message: error.message })
        }
        throw new HTTPException(500, { message: 'Internal server error' })
    }
})

export default movieRoutes
