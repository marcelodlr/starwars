import { searchMovies, getMovie } from './service'
import { describe, it, expect, beforeAll, spyOn } from 'bun:test'
import { httpClient } from '~/shared'

describe('getMovies', () => {
    it('should return a list of movies', async () => {
        spyOn(httpClient, 'get').mockResolvedValue({
            data: {
                result: [
                    { uid: '1', properties: { title: 'Movie 1' } },
                    { uid: '2', properties: { title: 'Movie 2' } },
                ],
            },
        })
        const movies = await searchMovies(undefined)
        expect(httpClient.get).toHaveBeenCalledWith('/films', {
            params: { title: undefined },
        })
        expect(movies).toEqual([
            { title: 'Movie 1', id: '1' },
            { title: 'Movie 2', id: '2' },
        ])
    })
    it('should return a list of movies', async () => {
        spyOn(httpClient, 'get').mockResolvedValue({
            data: {
                result: [{ uid: '1', properties: { title: 'Movie 1' } }],
            },
        })
        const movies = await searchMovies('Movie 1')
        expect(httpClient.get).toHaveBeenCalledWith('/films', {
            params: { title: 'Movie 1' },
        })
        expect(movies).toEqual([{ title: 'Movie 1', id: '1' }])
    })
})

describe('getMovie', () => {
    it('should return movie details by id', async () => {
        const mockMovieProperties = {
            title: 'A New Hope',
            episode_id: 4,
            opening_crawl: 'It is a period of civil war...',
            director: 'George Lucas',
            producer: 'Gary Kurtz, Rick McCallum',
            release_date: '1977-05-25',
            species: ['https://swapi.dev/api/species/1/'],
            starships: ['https://swapi.dev/api/starships/2/'],
            vehicles: ['https://swapi.dev/api/vehicles/4/'],
            characters: [
                'https://swapi.dev/api/people/1/',
                'https://swapi.dev/api/people/2/',
            ],
            planets: ['https://swapi.dev/api/planets/1/'],
            url: 'https://swapi.dev/api/films/1/',
            created: '2014-12-10T14:23:31.880000Z',
            edited: '2014-12-20T19:49:45.256000Z',
        }

        spyOn(httpClient, 'get').mockResolvedValue({
            data: {
                result: {
                    uid: '1',
                    properties: mockMovieProperties,
                },
            },
        })

        const movie = await getMovie('1')
        expect(httpClient.get).toHaveBeenCalledWith('/films/1')
        expect(movie).toEqual({
            id: '1',
            title: 'A New Hope',
            opening_crawl: 'It is a period of civil war...',
            characters: [
                'https://swapi.dev/api/people/1/',
                'https://swapi.dev/api/people/2/',
            ],
        })
    })
})
