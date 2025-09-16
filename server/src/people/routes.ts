import { Hono } from 'hono'
import { getPeople, getPerson } from './service'
import { HTTPException } from 'hono/http-exception'
import { EntityNotFoundException } from '~/shared/exceptions'

const peopleRoutes = new Hono()

peopleRoutes.get('/', async (c) => {
    const query = c.req.query('query')
    const people = await getPeople(query)
    return c.json(people)
})

peopleRoutes.get('/:id', async (c) => {
    const id = c.req.param('id')
    try {
        const person = await getPerson(id)
        return c.json(person)
    } catch (error) {
        if (error instanceof EntityNotFoundException) {
            throw new HTTPException(404, { message: error.message })
        }
        throw new HTTPException(500, { message: 'Internal server error' })
    }
})

export default peopleRoutes
