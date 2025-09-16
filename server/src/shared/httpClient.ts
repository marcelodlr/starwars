import axios from 'axios'

const httpClient = axios.create({
    baseURL: 'https://swapi.tech/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add retry logic for rate limiting
httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error
        
        if (response?.status === 429 && !config._retry) {
            config._retry = true
            const retryAfter = response.headers['retry-after'] || 1
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
            return httpClient(config)
        }
        
        return Promise.reject(error)
    }
)

export type BaseResponse<T> = {
    message: string
    result: BaseItem<T>
}
export type BaseListResponse<T> = {
    message: string
    result: BaseItem<T>[]
}

export type BaseItem<T> = {
    properties: T
    uid: string
}

export interface BasePaginatedResponse<T = PaginatedItem> {
    total_records: number
    total_pages: number
    next: number | null
    previous: number | null
    results: T[]
}

type PaginatedItem = {
    uid: string
    name: string
}

export default httpClient
