import { searchMovies, getMovie } from './service'
import { describe, it, expect, beforeAll, spyOn } from 'bun:test'
import { MovieDatabase } from './database'
import { PeopleDatabase } from '~/people/database'

describe('searchMovies', () => {
    it('should return a list of movies when no query is provided', async () => {
        spyOn(MovieDatabase, 'searchMovies').mockReturnValue([
            { id: '1', name: 'Movie 1' },
            { id: '2', name: 'Movie 2' },
        ])
        
        const movies = await searchMovies(undefined)
        
        expect(MovieDatabase.searchMovies).toHaveBeenCalledWith('')
        expect(movies).toEqual([
            { title: 'Movie 1', id: '1' },
            { title: 'Movie 2', id: '2' },
        ])
    })
    
    it('should return filtered movies when query is provided', async () => {
        spyOn(MovieDatabase, 'searchMovies').mockReturnValue([
            { id: '1', name: 'Movie 1' }
        ])
        
        const movies = await searchMovies('Movie 1')
        
        expect(MovieDatabase.searchMovies).toHaveBeenCalledWith('Movie 1')
        expect(movies).toEqual([{ title: 'Movie 1', id: '1' }])
    })
})

describe('getMovie', () => {
    it('should return movie details by id', async () => {
        const mockDatabaseMovie = {
            id: '1',
            title: 'A New Hope',
            episode_id: 4,
            opening_crawl: 'It is a period of civil war...',
            director: 'George Lucas',
            producer: 'Gary Kurtz, Rick McCallum',
            release_date: '1977-05-25',
            species: ['https://swapi.dev/api/species/1/'],
            starships: ['https://swapi.dev/api/starships/2/'],
            vehicles: ['https://swapi.dev/api/vehicles/4/'],
            characters: ['1', '2'],
            planets: ['https://swapi.dev/api/planets/1/'],
            url: 'https://swapi.dev/api/films/1/',
            created: '2014-12-10T14:23:31.880000Z',
            edited: '2014-12-20T19:49:45.256000Z',
        }

        const mockCharacters = [
            { id: '1', name: 'Luke Skywalker', height: '172', mass: '77', hair_color: 'blond', skin_color: 'fair', eye_color: 'blue', birth_year: '19BBY', gender: 'male', homeworld: 'https://swapi.dev/api/planets/1/', films: [], species: [], vehicles: [], starships: [], created: '', edited: '', url: '' },
            { id: '2', name: 'C-3PO', height: '167', mass: '75', hair_color: 'n/a', skin_color: 'gold', eye_color: 'yellow', birth_year: '112BBY', gender: 'n/a', homeworld: 'https://swapi.dev/api/planets/1/', films: [], species: [], vehicles: [], starships: [], created: '', edited: '', url: '' }
        ]

        spyOn(MovieDatabase, 'getMovie').mockReturnValue(mockDatabaseMovie)
        spyOn(PeopleDatabase, 'getPerson')
            .mockReturnValueOnce(mockCharacters[0])
            .mockReturnValueOnce(mockCharacters[1])

        const movie = await getMovie('1')
        
        expect(MovieDatabase.getMovie).toHaveBeenCalledWith('1')
        expect(PeopleDatabase.getPerson).toHaveBeenCalledWith('1')
        expect(PeopleDatabase.getPerson).toHaveBeenCalledWith('2')
        expect(movie).toEqual({
            id: '1',
            title: 'A New Hope',
            opening_crawl: 'It is a period of civil war...',
            characters: [
                { id: '1', name: 'Luke Skywalker' },
                { id: '2', name: 'C-3PO' },
            ],
        })
    })

    it('should throw EntityNotFoundException when movie is not found', async () => {
        spyOn(MovieDatabase, 'getMovie').mockReturnValue(null)

        await expect(getMovie('999')).rejects.toThrow("Movie with id '999' not found")
        expect(MovieDatabase.getMovie).toHaveBeenCalledWith('999')
    })
})
