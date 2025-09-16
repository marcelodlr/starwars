export interface BasePerson {
    id: string
    name: string
}

export interface Person extends BasePerson {
    birth_year: string
    eye_color: string
    gender: string
    hair_color: string
    height: string
    mass: string
    skin_color: string
    movies: {id: string, name: string}[]
}

export const getPeople = async (query?: string): Promise<BasePerson[]> => {
    const baseUrl = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api/')
    const url = new URL('people', baseUrl)

    if (query) {
        url.searchParams.append('query', query)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
        throw new Error(`Failed to fetch people: ${response.statusText}`)
    }

    return response.json()
}

export const getPerson = async (id: string): Promise<Person> => {
    const baseUrl = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api/')
    const url = new URL(`people/${id}`, baseUrl)

    const response = await fetch(url.toString())

    if (!response.ok) {
        throw new Error(`Failed to fetch person: ${response.statusText}`)
    }

    return response.json()
}
