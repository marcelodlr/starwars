import { describe, it, expect, spyOn, beforeEach, afterEach } from 'bun:test'
import { DataSeeder } from './seeder'
import httpClient from '../shared/httpClient'
import { MovieDatabase } from '../movies/database'
import { PeopleDatabase } from '../people/database'
import { db } from './init'

describe('DataSeeder', () => {
    beforeEach(() => {
        spyOn(console, 'log').mockImplementation(() => {})
        spyOn(console, 'error').mockImplementation(() => {})
    })


    describe('seedDatabase', () => {
        it('should skip seeding if database already has data', async () => {
            spyOn(db, 'prepare').mockReturnValue({
                get: () => ({ count: 5 })
            } as any)

            const httpSpy = spyOn(httpClient, 'get')
            
            await DataSeeder.seedDatabase()
            
            expect(httpSpy).not.toHaveBeenCalled()
            expect(console.log).toHaveBeenCalledWith('Database already has data, skipping seeding')
        })

        it('should seed database when no data exists', async () => {
            spyOn(db, 'prepare').mockReturnValue({
                get: () => ({ count: 0 })
            } as any)

            spyOn(httpClient, 'get')
                .mockResolvedValueOnce({
                    data: {
                        message: 'success',
                        result: [
                            {
                                uid: '1',
                                properties: {
                                    title: 'A New Hope',
                                    episode_id: 4,
                                    opening_crawl: 'It is a period of civil war...',
                                    director: 'George Lucas',
                                    producer: 'Gary Kurtz',
                                    release_date: '1977-05-25',
                                    characters: ['https://swapi.dev/api/people/1', 'https://swapi.dev/api/people/2'],
                                    planets: ['https://swapi.dev/api/planets/1/'],
                                    starships: ['https://swapi.dev/api/starships/2/'],
                                    vehicles: ['https://swapi.dev/api/vehicles/4/'],
                                    species: ['https://swapi.dev/api/species/1/'],
                                    created: '2014-12-10T14:23:31.880000Z',
                                    edited: '2014-12-20T19:49:45.256000Z',
                                    url: 'https://swapi.dev/api/films/1/'
                                }
                            }
                        ]
                    }
                })
                .mockResolvedValueOnce({
                    data: {
                        total_records: 1,
                        total_pages: 1,
                        next: null,
                        previous: null,
                        results: [
                            {
                                uid: '1',
                                properties: {
                                    name: 'Luke Skywalker',
                                    height: '172',
                                    mass: '77',
                                    hair_color: 'blond',
                                    skin_color: 'fair',
                                    eye_color: 'blue',
                                    birth_year: '19BBY',
                                    gender: 'male',
                                    homeworld: 'https://swapi.dev/api/planets/1/',
                                    films: ['https://swapi.dev/api/films/1'],
                                    species: [],
                                    vehicles: ['https://swapi.dev/api/vehicles/14/'],
                                    starships: ['https://swapi.dev/api/starships/12/'],
                                    created: '2014-12-09T13:50:51.644000Z',
                                    edited: '2014-12-20T21:17:56.891000Z',
                                    url: 'https://swapi.dev/api/people/1/'
                                }
                            }
                        ]
                    }
                })

            spyOn(MovieDatabase, 'saveMovie').mockImplementation(() => {})
            spyOn(PeopleDatabase, 'savePerson').mockImplementation(() => {})

            await DataSeeder.seedDatabase()

            expect(httpClient.get).toHaveBeenCalledWith('/films/')
            expect(httpClient.get).toHaveBeenCalledWith('/people?page=1&limit=100&expanded=true')
            expect(MovieDatabase.saveMovie).toHaveBeenCalledWith('1', {
                title: 'A New Hope',
                episode_id: 4,
                opening_crawl: 'It is a period of civil war...',
                director: 'George Lucas',
                producer: 'Gary Kurtz',
                release_date: '1977-05-25',
                characters: ['1', '2'],
                planets: ['https://swapi.dev/api/planets/1/'],
                starships: ['https://swapi.dev/api/starships/2/'],
                vehicles: ['https://swapi.dev/api/vehicles/4/'],
                species: ['https://swapi.dev/api/species/1/'],
                created: '2014-12-10T14:23:31.880000Z',
                edited: '2014-12-20T19:49:45.256000Z',
                url: 'https://swapi.dev/api/films/1/'
            })
            expect(PeopleDatabase.savePerson).toHaveBeenCalledWith('1', {
                name: 'Luke Skywalker',
                height: '172',
                mass: '77',
                hair_color: 'blond',
                skin_color: 'fair',
                eye_color: 'blue',
                birth_year: '19BBY',
                gender: 'male',
                homeworld: 'https://swapi.dev/api/planets/1/',
                films: ['1'],
                species: [],
                vehicles: ['https://swapi.dev/api/vehicles/14/'],
                starships: ['https://swapi.dev/api/starships/12/'],
                created: '2014-12-09T13:50:51.644000Z',
                edited: '2014-12-20T21:17:56.891000Z',
                url: 'https://swapi.dev/api/people/1/'
            })
            expect(console.log).toHaveBeenCalledWith('Database seeding completed successfully!')
        })

        it('should handle errors during seeding', async () => {
            spyOn(db, 'prepare').mockReturnValue({
                get: () => ({ count: 0 })
            } as any)

            spyOn(httpClient, 'get').mockRejectedValue(new Error('Network error'))

            await DataSeeder.seedDatabase()
            
            expect(console.error).toHaveBeenCalledWith('Failed to fetch movies:', expect.any(Error))
            expect(console.log).toHaveBeenCalledWith('Database seeding completed successfully!')
        })
    })

    describe('seedMovies', () => {
        it('should handle movie seeding errors gracefully', async () => {
            spyOn(db, 'prepare').mockReturnValue({
                get: () => ({ count: 0 })
            } as any)

            spyOn(httpClient, 'get')
                .mockResolvedValueOnce({
                    data: {
                        message: 'success',
                        result: [
                            {
                                uid: '1',
                                properties: {
                                    title: 'A New Hope',
                                    episode_id: 4,
                                    opening_crawl: 'It is a period of civil war...',
                                    director: 'George Lucas',
                                    producer: 'Gary Kurtz',
                                    release_date: '1977-05-25',
                                    characters: ['https://swapi.dev/api/people/1'],
                                    planets: [],
                                    starships: [],
                                    vehicles: [],
                                    species: [],
                                    created: '2014-12-10T14:23:31.880000Z',
                                    edited: '2014-12-20T19:49:45.256000Z',
                                    url: 'https://swapi.dev/api/films/1/'
                                }
                            }
                        ]
                    }
                })
                .mockRejectedValueOnce(new Error('People API error'))

            spyOn(MovieDatabase, 'saveMovie').mockImplementation(() => {})

            await DataSeeder.seedDatabase()
            
            expect(MovieDatabase.saveMovie).toHaveBeenCalledWith('1', expect.any(Object))
            expect(console.log).toHaveBeenCalledWith('Saved movie: A New Hope')
            expect(console.log).toHaveBeenCalledWith('Database seeding completed successfully!')
        })
    })

    describe('seedPeople', () => {
        it('should handle pagination correctly', async () => {
            spyOn(db, 'prepare').mockReturnValue({
                get: () => ({ count: 0 })
            } as any)

            spyOn(httpClient, 'get')
                .mockResolvedValueOnce({
                    data: { message: 'success', result: [] }
                })
                .mockResolvedValueOnce({
                    data: {
                        total_records: 2,
                        total_pages: 2,
                        next: 2,
                        previous: null,
                        results: [
                            {
                                uid: '1',
                                properties: {
                                    name: 'Luke Skywalker',
                                    height: '172',
                                    mass: '77',
                                    hair_color: 'blond',
                                    skin_color: 'fair',
                                    eye_color: 'blue',
                                    birth_year: '19BBY',
                                    gender: 'male',
                                    homeworld: 'https://swapi.dev/api/planets/1/',
                                    films: ['https://swapi.dev/api/films/1'],
                                    species: [],
                                    vehicles: [],
                                    starships: [],
                                    created: '2014-12-09T13:50:51.644000Z',
                                    edited: '2014-12-20T21:17:56.891000Z',
                                    url: 'https://swapi.dev/api/people/1/'
                                }
                            }
                        ]
                    }
                })
                .mockResolvedValueOnce({
                    data: {
                        total_records: 2,
                        total_pages: 2,
                        next: null,
                        previous: 1,
                        results: [
                            {
                                uid: '2',
                                properties: {
                                    name: 'C-3PO',
                                    height: '167',
                                    mass: '75',
                                    hair_color: 'n/a',
                                    skin_color: 'gold',
                                    eye_color: 'yellow',
                                    birth_year: '112BBY',
                                    gender: 'n/a',
                                    homeworld: 'https://swapi.dev/api/planets/1/',
                                    films: ['https://swapi.dev/api/films/1'],
                                    species: [],
                                    vehicles: [],
                                    starships: [],
                                    created: '2014-12-10T15:10:51.357000Z',
                                    edited: '2014-12-20T21:17:50.309000Z',
                                    url: 'https://swapi.dev/api/people/2/'
                                }
                            }
                        ]
                    }
                })

            spyOn(PeopleDatabase, 'savePerson').mockImplementation(() => {})

            await DataSeeder.seedDatabase()

            expect(httpClient.get).toHaveBeenCalledWith('/people?page=1&limit=100&expanded=true')
            expect(httpClient.get).toHaveBeenCalledWith('/people?page=2&limit=100&expanded=true')
            expect(PeopleDatabase.savePerson).toHaveBeenCalledWith('1', expect.objectContaining({
                name: 'Luke Skywalker',
                films: ['1']
            }))
            expect(PeopleDatabase.savePerson).toHaveBeenCalledWith('2', expect.objectContaining({
                name: 'C-3PO',
                films: ['1']
            }))
        })

        it('should handle people API errors gracefully', async () => {
            spyOn(db, 'prepare').mockReturnValue({
                get: () => ({ count: 0 })
            } as any)

            spyOn(httpClient, 'get')
                .mockResolvedValueOnce({
                    data: { message: 'success', result: [] }
                })
                .mockResolvedValueOnce({
                    data: {
                        total_records: 1,
                        total_pages: 2,
                        next: 2,
                        previous: null,
                        results: [
                            {
                                uid: '1',
                                properties: {
                                    name: 'Luke Skywalker',
                                    height: '172',
                                    mass: '77',
                                    hair_color: 'blond',
                                    skin_color: 'fair',
                                    eye_color: 'blue',
                                    birth_year: '19BBY',
                                    gender: 'male',
                                    homeworld: 'https://swapi.dev/api/planets/1/',
                                    films: ['https://swapi.dev/api/films/1'],
                                    species: [],
                                    vehicles: [],
                                    starships: [],
                                    created: '2014-12-09T13:50:51.644000Z',
                                    edited: '2014-12-20T21:17:56.891000Z',
                                    url: 'https://swapi.dev/api/people/1/'
                                }
                            }
                        ]
                    }
                })

                .mockRejectedValueOnce(new Error('API rate limit'))

            spyOn(PeopleDatabase, 'savePerson').mockImplementation(() => {})

            await DataSeeder.seedDatabase()

            expect(PeopleDatabase.savePerson).toHaveBeenCalledWith('1', expect.objectContaining({
                name: 'Luke Skywalker',
                films: ['1']
            }))
            expect(console.error).toHaveBeenCalledWith('Failed to fetch people page 2:', expect.any(Error))
            expect(console.log).toHaveBeenCalledWith('Database seeding completed successfully!')
        })
    })

    describe('isDatabaseSeeded', () => {
        it('should return true when both movies and people exist', async () => {
            spyOn(db, 'prepare').mockReturnValue({
                get: () => ({ count: 5 })
            } as any)

            await DataSeeder.seedDatabase()

            expect(console.log).toHaveBeenCalledWith('Database already has data, skipping seeding')
        })

        it('should return false when no movies exist', async () => {
            let callCount = 0
            spyOn(db, 'prepare').mockReturnValue({
                get: () => {
                    callCount++
                    return { count: callCount === 1 ? 0 : 5 } // First call (movies) returns 0, second (people) returns 5
                }
            } as any)

            spyOn(httpClient, 'get')
                .mockResolvedValueOnce({ data: { message: 'success', result: [] } })
                .mockResolvedValueOnce({
                    data: {
                        total_records: 0,
                        total_pages: 0,
                        next: null,
                        previous: null,
                        results: []
                    }
                })

            await DataSeeder.seedDatabase()

            expect(console.log).toHaveBeenCalledWith('Starting database seeding...')
        })

        it('should handle database errors gracefully', async () => {
            spyOn(db, 'prepare').mockImplementation(() => {
                throw new Error('Database connection error')
            })

            spyOn(httpClient, 'get')
                .mockResolvedValueOnce({ data: { message: 'success', result: [] } })
                .mockResolvedValueOnce({
                    data: {
                        total_records: 0,
                        total_pages: 0,
                        next: null,
                        previous: null,
                        results: []
                    }
                })

            await DataSeeder.seedDatabase()

            expect(console.error).toHaveBeenCalledWith('Error checking seeding status:', expect.any(Error))
            expect(console.log).toHaveBeenCalledWith('Starting database seeding...')
        })
    })
})
