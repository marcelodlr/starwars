import { httpClient } from '~/shared'
import { BaseItem, BaseListResponse, BasePaginatedResponse, BaseResponse } from '~/shared/httpClient'
import { BasePerson, Person } from './types'
import { PeopleDatabase } from './database'
import { getMovie } from '~/movies/service'
import { Movie } from '~/movies/types'
import { EntityNotFoundException } from '~/shared/exceptions'
import { DatabaseMovie, DatabasePerson } from '~/database'
import { MovieDatabase } from '~/movies/database'

export type PersonProperties = {
    name: string
    birth_year: string
    eye_color: string
    gender: string
    hair_color: string
    height: string
    mass: string
    skin_color: string
    homeworld: string
    films: string[]
    species: string[]
    starships: string[]
    vehicles: string[]
    url: string
    created: string
    edited: string
}

export const getPeople = async (name?: string): Promise<BasePerson[]> => {
    const results = PeopleDatabase.searchPeople(name ?? '');
    return results.map(person => ({ name: person.name, id: person.id }));
}

export const getPerson = async (id: string): Promise<Person> => {
    // Try to get from database first
    const person = PeopleDatabase.getPerson(id);
    if (!person) {
        throw new EntityNotFoundException('Person', id);
    }
    const movies = person.films.map(movie => MovieDatabase.getMovie(movie)).filter(Boolean) as DatabaseMovie[];
    return transformToPerson(person, movies);
    
}

export default {
    getPeople,
    getPerson,
}

const transformToPerson = (dbPerson: DatabasePerson, movies: DatabaseMovie[]): Person => {
    return {
      id: dbPerson.id,
      name: dbPerson.name,
      birth_year: dbPerson.birth_year,
      gender: dbPerson.gender,
      eye_color: dbPerson.eye_color,
      hair_color: dbPerson.hair_color,
      height: dbPerson.height,
      mass: dbPerson.mass,
      movies: movies.map(movie => ({ id: movie.id, name: movie.title })),
    };
  }