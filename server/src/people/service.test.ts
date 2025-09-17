import { getPeople, getPerson } from './service'
import { describe, it, expect, spyOn } from 'bun:test'
import { PeopleDatabase } from './database'
import { MovieDatabase } from '~/movies/database'

describe('getPeople', () => {
    it('should return a list of people without query', async () => {
        spyOn(PeopleDatabase, 'searchPeople').mockReturnValue([
            { id: '1', name: 'Luke Skywalker' },
            { id: '2', name: 'Darth Vader' },
        ])
        
        const people = await getPeople(undefined)
        
        expect(PeopleDatabase.searchPeople).toHaveBeenCalledWith('')
        expect(people).toEqual([
            { name: 'Luke Skywalker', id: '1' },
            { name: 'Darth Vader', id: '2' },
        ])
    })

    it('should return filtered people with name query', async () => {
        spyOn(PeopleDatabase, 'searchPeople').mockReturnValue([
            { id: '1', name: 'Luke Skywalker' }
        ])
        
        const people = await getPeople('Luke')
        
        expect(PeopleDatabase.searchPeople).toHaveBeenCalledWith('Luke')
        expect(people).toEqual([{ name: 'Luke Skywalker', id: '1' }])
    })
})

describe('getPerson', () => {
    it('should return person details by id', async () => {
        const mockDatabasePerson = {
            id: '45',
            name: 'Bib Fortuna',
            birth_year: '24BBY',
            gender: 'male',
            eye_color: 'brown',
            hair_color: 'black',
            height: '183',
            mass: '84',
            skin_color: 'pale',
            homeworld: 'https://swapi.dev/api/planets/37/',
            films: ['3'],
            species: ['https://swapi.dev/api/species/7/'],
            starships: [],
            vehicles: [],
            url: 'https://swapi.dev/api/people/45/',
            created: '2014-12-20T09:47:02.512000Z',
            edited: '2014-12-20T21:17:50.325000Z',
        }

        const mockMovie = {
            id: '3',
            title: 'Return of the Jedi',
            episode_id: 6,
            opening_crawl: 'Luke Skywalker has returned...',
            director: 'Richard Marquand',
            producer: 'Howard G. Kazanjian, George Lucas, Rick McCallum',
            release_date: '1983-05-25',
            species: [],
            starships: [],
            vehicles: [],
            characters: ['45'],
            planets: [],
            url: 'https://swapi.dev/api/films/3/',
            created: '2014-12-18T10:39:33.255000Z',
            edited: '2014-12-20T09:48:37.462000Z',
        }

        spyOn(PeopleDatabase, 'getPerson').mockReturnValue(mockDatabasePerson)
        spyOn(MovieDatabase, 'getMovie').mockReturnValue(mockMovie)

        const person = await getPerson('45')
        
        expect(PeopleDatabase.getPerson).toHaveBeenCalledWith('45')
        expect(MovieDatabase.getMovie).toHaveBeenCalledWith('3')
        expect(person).toEqual({
            id: '45',
            name: 'Bib Fortuna',
            birth_year: '24BBY',
            gender: 'male',
            eye_color: 'brown',
            hair_color: 'black',
            height: '183',
            mass: '84',
            movies: [{ id: '3', name: 'Return of the Jedi' }],
        })
    })

    it('should throw EntityNotFoundException when person is not found', async () => {
        spyOn(PeopleDatabase, 'getPerson').mockReturnValue(null)

        await expect(getPerson('999')).rejects.toThrow("Person with id '999' not found")
        expect(PeopleDatabase.getPerson).toHaveBeenCalledWith('999')
    })
})
