export interface BasePerson {
    id: string
    name: string
}

export interface Person extends BasePerson {
    birth_year: string
    gender: string
    eye_color: string
    hair_color: string
    height: string
    mass: string
    movies: {id: string, name: string}[]
}
