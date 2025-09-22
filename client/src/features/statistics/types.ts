export type Statistics = {
    lastUpdated: Date
    top5Queries: {path: string, count: number}[]
    totalRequests: number;
    popularCharacters: {characterId: string, requestCount: number, name: string}[]
    popularMovies: {movieId: string, requestCount: number, name: string}[]
}