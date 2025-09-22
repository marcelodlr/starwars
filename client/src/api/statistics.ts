import type { Statistics } from "../features/statistics"


type StatisticsResponse = {
    message: string;
    data: {
        lastUpdated: string;
        requestData: {
            top5Queries: {path: string, count: number}[];
            totalRequests: number;
        };
        contentData: {
            popularCharacters: {characterId: string, requestCount: number, name: string}[];
            popularMovies: {movieId: string, requestCount: number, name: string}[];
        };
    };
}

export const getStatistics = async (): Promise<Statistics> => {
    const baseUrl = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api/')
    const url = new URL(`statistics`, baseUrl)

    const response = await fetch(url.toString())

    if (!response.ok) {
        throw new Error(`Failed to fetch movie: ${response.statusText}`)
    }

    const {data} = await response.json() as StatisticsResponse

    return {
        lastUpdated: new Date(data.lastUpdated),
        top5Queries: data.requestData.top5Queries,
        totalRequests: data.requestData.totalRequests,
        popularCharacters: data.contentData.popularCharacters,
        popularMovies: data.contentData.popularMovies,
    }
}