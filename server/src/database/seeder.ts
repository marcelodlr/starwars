import httpClient from '../shared/httpClient';
import { MovieDatabase } from '../movies/database';
import { PeopleDatabase } from '../people/database';
import { db } from './init';
import type { BasePaginatedResponse, BaseListResponse, BaseItem } from '../shared/httpClient';
import type { MovieProperties } from '../movies/service';
import { type PersonProperties } from '../people/service';
import { getEntityId } from '~/shared/utils';

export class DataSeeder {
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async seedDatabase(): Promise<void> {
    console.log('Checking if database needs seeding...');
    
    try {
      // Check if database already has data
      if (this.isDatabaseSeeded()) {
        console.log('Database already has data, skipping seeding');
        return;
      }

      console.log('Starting database seeding...');
      await this.seedMovies();
      await this.seedPeople();
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Database seeding failed:', error);
      throw error;
    }
  }

  private static isDatabaseSeeded(): boolean {
    try {
      const movieCount = db.prepare(`
        SELECT COUNT(*) as count FROM entities WHERE type = 'movie'
      `).get() as { count: number };

      const peopleCount = db.prepare(`
        SELECT COUNT(*) as count FROM entities WHERE type = 'person'
      `).get() as { count: number };

      return movieCount.count > 0 && peopleCount.count > 0;
    } catch (error) {
      console.error('Error checking seeding status:', error);
      return false;
    }
  }

  private static clearDatabase(): void {
    try {
      console.log('Clearing all database tables...');
      
      // Clear all data from all tables
      db.prepare(`DELETE FROM entities`).run();
      db.prepare(`DELETE FROM request_events`).run();
      
      console.log('All database tables cleared');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  private static async seedMovies(): Promise<void> {
    console.log('Seeding movies...');
    
    try {
      const response: BaseListResponse<MovieProperties> = (await httpClient.get('/films/')).data;
      
      const moviesList = response.result;
      
      for (const movieItem of moviesList) {
        try {
          const { uid, properties } = movieItem;

          MovieDatabase.saveMovie(uid, {...properties, characters: properties.characters.map(getEntityId)});
          console.log(`Saved movie: ${properties.title}`);
          
        } catch (error) {
          console.error(`Failed to seed movie ${movieItem.properties.title}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    }
  }


  private static async seedPeople(): Promise<void> {
    console.log('Seeding people...');
    
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      try {
        const response: BasePaginatedResponse<BaseItem<PersonProperties>> = (await httpClient.get(`/people?page=${page}&limit=100&expanded=true`)).data;

        const peopleList = response.results;
         for (const personItem of peopleList) {
            const { properties, uid } = personItem;
            try {
             PeopleDatabase.savePerson(uid, {...properties, films: properties.films.map(getEntityId)});
             console.log(`Saved person: ${properties.name}`);
          } catch (error) {
            console.error(`Failed to seed person ${properties.name}:`, error);
          }
        }

      
        
        if (!response.next) {
          hasMore = false;
        }else{
          page++;
        }
      } catch (error) {
        console.error(`Failed to fetch people page ${page}:`, error);
        hasMore = false;
      }
    }
  }
}
