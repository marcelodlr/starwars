export interface DatabaseStatistics {
    id: number
    top5_queries: string // JSON string
    total_requests: number
    popular_characters: string | null // JSON string
    popular_movies: string | null // JSON string
    computed_at: string // ISO string
    created_at: string
    updated_at: string
}

export interface StatisticsInsert {
    top5_queries: Array<{path: string, count: number}>
    total_requests: number
    popular_characters?: Array<{characterId: string, requestCount: number, name: string}>
    popular_movies?: Array<{movieId: string, requestCount: number, name: string}>
    computed_at: Date
}

export interface ComputedStatistics {
    top5_queries: Array<{path: string, count: number, name: string}>
    total_requests: number
    popular_characters: Array<{characterId: string, requestCount: number, name: string}>
    popular_movies: Array<{movieId: string, requestCount: number, name: string}>
    computed_at: Date
}
