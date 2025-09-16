import type { SearchType } from '../features/search/types'
import { getMovies } from './movies'
import { getPeople } from './people'

interface SearchResult {
    name: string
    id: string
}

export const getSearch = async (
    searchType: SearchType,
    searchQuery: string
): Promise<SearchResult[]> => {
    const results: SearchResult[] = []
    if (searchType === 'people') {
        const people = await getPeople(searchQuery)
        results.push(
            ...people.map((person) => ({
                name: person.name,
                id: person.id,
            }))
        )
    } else {
        const movies = await getMovies(searchQuery)
        results.push(
            ...movies.map((movie) => ({
                name: movie.title,
                id: movie.id,
            }))
        )
    }
    return results
}
