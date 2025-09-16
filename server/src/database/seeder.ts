import httpClient from '../shared/httpClient';
import { MovieDatabase } from '../movies/database';
import { PeopleDatabase } from '../people/database';
import type { BaseResponse, BasePaginatedResponse, BaseListResponse, BaseItem } from '../shared/httpClient';
import type { MovieProperties } from '../movies/service';
import { getPeoplePaginated, type PersonProperties } from '../people/service';
import { getEntityId } from '~/shared/utils';

export class DataSeeder {
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async seedDatabase(): Promise<void> {
    console.log('🌱 Starting database seeding...');
    
    try {
      await this.seedMovies();
      await this.seedPeople();
      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('Database seeding failed:', error);
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
