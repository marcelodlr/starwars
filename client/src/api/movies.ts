export interface BaseMovie {
    id: string
    title: string
}

export interface Movie extends BaseMovie {
    opening_crawl: string
    characters: {id: string, name: string}[]
}

export const getMovies = async (query?: string): Promise<BaseMovie[]> => {
    const baseUrl = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api/')
    const url = new URL('movies', baseUrl)

    if (query) {
        url.searchParams.append('query', query)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.statusText}`)
    }

    return response.json()
}

export const getMovie = async (id: string): Promise<Movie> => {
    const baseUrl = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api/')
    const url = new URL(`movies/${id}`, baseUrl)

    const response = await fetch(url.toString())

    if (!response.ok) {
        throw new Error(`Failed to fetch movie: ${response.statusText}`)
    }

    return response.json()
}
