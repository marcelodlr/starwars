import { httpClient } from '~/shared'
import { BaseItem, BaseListResponse, BaseResponse } from '~/shared/httpClient'
import { BaseMovie, Movie } from './types'
import { MovieDatabase } from './database'
import { getPerson } from '~/people/service'
import { Person } from '~/people/types'
import { EntityNotFoundException } from '~/shared/exceptions'
import { DatabaseMovie, DatabasePerson } from '~/database'
import { PeopleDatabase } from '~/people/database'

export type MovieProperties = {
    title: string
    episode_id: number
    opening_crawl: string
    director: string
    producer: string
    release_date: string
    species: string[]
    starships: string[]
    vehicles: string[]
    characters: string[]
    planets: string[]
    url: string
    created: string
    edited: string
}

export const searchMovies = async (
    query: string | undefined
): Promise<BaseMovie[]> => {
    // Try to get from database first
    const results = MovieDatabase.searchMovies(query ?? '');
    return results.map(movie => ({ title: movie.name, id: movie.id }));
}

export const getMovie = async (id: string): Promise<Movie> => {
    // Try to get from database first
    const dbMovie = MovieDatabase.getMovie(id);
    if (!dbMovie) {
        throw new EntityNotFoundException('Movie', id);
    }
    const characters = dbMovie.characters.map(character => PeopleDatabase.getPerson(character)).filter(Boolean) as DatabasePerson[];

    return transformToMovie(dbMovie, characters ?? []);
}

export const getMoviesProperties = async (): Promise<BaseItem<MovieProperties>[]> => {
    const response: BaseListResponse<MovieProperties> = await httpClient.get('/films');
    return response.result;
}

export default {
    getMovies: searchMovies,
    getMoviesProperties,
    getMovie,
}
const transformToMovie = (dbMovie: DatabaseMovie, characters: DatabasePerson[]): Movie => {
    return {
      id: dbMovie.id,
      title: dbMovie.title,
      opening_crawl: dbMovie.opening_crawl,
      characters: characters.map(character => ({ id: character.id, name: character.name })),
    };
  }