import { getPeople, getPerson } from './service'
import { describe, it, expect, spyOn } from 'bun:test'
import { httpClient } from '~/shared'

describe('getPeople', () => {
    it('should return a list of people without query', async () => {
        spyOn(httpClient, 'get').mockResolvedValue({
            data: {
                result: [
                    { uid: '1', properties: { name: 'Luke Skywalker' } },
                    { uid: '2', properties: { name: 'Darth Vader' } },
                ],
            },
        })
        const people = await getPeople(undefined)
        expect(httpClient.get).toHaveBeenCalledWith('/people', {
            params: { name: undefined },
        })
        expect(people).toEqual([
            { name: 'Luke Skywalker', id: '1' },
            { name: 'Darth Vader', id: '2' },
        ])
    })

    it('should return filtered people with name query', async () => {
        spyOn(httpClient, 'get').mockResolvedValue({
            data: {
                result: [{ uid: '1', properties: { name: 'Luke Skywalker' } }],
            },
        })
        const people = await getPeople('Luke')
        expect(httpClient.get).toHaveBeenCalledWith('/people', {
            params: { name: 'Luke' },
        })
        expect(people).toEqual([{ name: 'Luke Skywalker', id: '1' }])
    })
})

describe('getPerson', () => {
    it('should return person details by id', async () => {
        const mockPersonProperties = {
            name: 'Bib Fortuna',
            birth_year: '24BBY',
            gender: 'male',
            eye_color: 'brown',
            hair_color: 'black',
            height: '183',
            mass: '84',
            skin_color: 'pale',
            homeworld: 'https://swapi.dev/api/planets/37/',
            films: ['https://swapi.dev/api/films/3/'],
            species: ['https://swapi.dev/api/species/7/'],
            starships: [],
            vehicles: [],
            url: 'https://swapi.dev/api/people/45/',
            created: '2014-12-20T09:47:02.512000Z',
            edited: '2014-12-20T21:17:50.325000Z',
        }

        spyOn(httpClient, 'get').mockResolvedValue({
            data: {
                result: {
                    uid: '45',
                    properties: mockPersonProperties,
                },
            },
        })

        const person = await getPerson('45')
        expect(httpClient.get).toHaveBeenCalledWith('/people/45')
        expect(person).toEqual({
            id: '45',
            name: 'Bib Fortuna',
            birth_year: '24BBY',
            gender: 'male',
            eye_color: 'brown',
            hair_color: 'black',
            height: '183',
            mass: '84',
            movies: ['https://swapi.dev/api/films/3/'],
        })
    })
})
