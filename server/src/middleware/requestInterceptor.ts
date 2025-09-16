import { Context, Next } from 'hono'
import { EventEmitter } from 'events'
import { requestEventsService } from '../database/requestEventsService'

export interface RequestEvent {
    id: string
    method: string
    path: string
    timestamp: Date
    responseTime?: number
    statusCode?: number
}

class RequestEventEmitter extends EventEmitter {}
export const requestEventEmitter = new RequestEventEmitter()

export const requestInterceptor = async (c: Context, next: Next) => {
    if(c.req.path.includes('/statistics')) {
        await next()
        return
    }

    const startTime = Date.now()
    const requestId = crypto.randomUUID()
    
    const timestamp = new Date()

    try {
        await next()
        
        if (c.res.status === 200) {
            const responseTime = Date.now() - startTime
            console.log('Response time:', responseTime)
            const requestEvent: RequestEvent = {
                id: requestId,
                method: c.req.method,
                path: c.req.path,
                timestamp,
                responseTime,
                statusCode: c.res.status
            }

            try {
                requestEventsService.insertEvent({
                    id: requestId,
                    method: c.req.method,
                    path: c.req.path,
                    timestamp,
                    response_time: responseTime,
                    status_code: c.res.status,
                    status: 'pending'
                })
            } catch (error) {
                console.error('Failed to store request event:', error)
            }

            requestEventEmitter.emit('request:success', requestEvent)
        }
    } catch (error) {
        // Don't track failed requests for statistics
        throw error
    }
}
