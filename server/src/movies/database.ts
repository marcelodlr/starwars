import { db } from '../database/init';
import type { Movie } from './types';
import type { MovieProperties } from './service';
import type { DatabaseMovie } from '../database/types';
import type { Statement } from 'bun:sqlite';

interface MovieQueries {
  insertMovie: Statement<void, [string, string]>;
  getMovie: Statement<{ data: string } | undefined, [string]>;
  getAllMovies: Statement<{ data: string }, []>;
  searchMovies: Statement<{ data: string }, [string, number]>;
}

class MovieQueryManager {
  private static instance: MovieQueries | null = null;

  static get queries(): MovieQueries {
    if (!this.instance) {
      this.instance = {
        insertMovie: db.prepare(`
          INSERT OR REPLACE INTO entities (id, type, data)
          VALUES (?, 'movie', ?)
        `),
        getMovie: db.prepare("SELECT data FROM entities WHERE id = ? AND type = 'movie'"),
        getAllMovies: db.prepare("SELECT data FROM entities WHERE type = 'movie'"),
        searchMovies: db.prepare("SELECT data FROM entities WHERE type = 'movie' AND json_extract(data, '$.title') LIKE ? LIMIT ?"),
      };
    }
    return this.instance;
  }
}

export class MovieDatabase {
  static saveMovie(id: string, properties: MovieProperties): void {
    const data = JSON.stringify({ id, ...properties });
    MovieQueryManager.queries.insertMovie.run(id, data);
  }

  static getMovie(id: string): DatabaseMovie | null {
    const row = MovieQueryManager.queries.getMovie.get(id);
    if (!row) return null;

    const data = JSON.parse(row.data) as DatabaseMovie;
    return data;
  }

  static getAllMovies(): DatabaseMovie[] {
    const rows = MovieQueryManager.queries.getAllMovies.all();
    return rows.map(row => JSON.parse(row.data) as DatabaseMovie);
  }

  static searchMovies(query: string, limit: number = 10): Array<{id: string, name: string}> {
    const rows = MovieQueryManager.queries.searchMovies.all(`%${query}%`, limit);
    return rows.map(row => {
      const data = JSON.parse(row.data) as DatabaseMovie;
      return { id: data.id, name: data.title };
    });
  }

  static movieExists(id: string): boolean {
    return this.getMovie(id) !== null;
  }

}

