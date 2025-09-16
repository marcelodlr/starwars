import { db } from '../database/init';
import type { Person } from './types';
import type { PersonProperties } from './service';
import type { DatabasePerson } from '../database/types';
import type { Statement } from 'bun:sqlite';

// Properly typed prepared statements
interface PeopleQueries {
  insertPerson: Statement<void, [string, string]>;
  getPerson: Statement<{ data: string } | undefined, [string]>;
  getAllPeople: Statement<{ data: string }, []>;
  searchPeople: Statement<{ data: string }, [string, number]>;
}

class PeopleQueryManager {
  private static instance: PeopleQueries | null = null;

  static get queries(): PeopleQueries {
    if (!this.instance) {
      this.instance = {
        insertPerson: db.prepare(`
          INSERT OR REPLACE INTO entities (id, type, data)
          VALUES (?, 'person', ?)
        `),
        getPerson: db.prepare("SELECT data FROM entities WHERE id = ? AND type = 'person'"),
        getAllPeople: db.prepare("SELECT data FROM entities WHERE type = 'person'"),
        searchPeople: db.prepare("SELECT data FROM entities WHERE type = 'person' AND json_extract(data, '$.name') LIKE ? LIMIT ?"),
      };
    }
    return this.instance;
  }
}

export class PeopleDatabase {
  static savePerson(id: string, properties: PersonProperties): void {
    const data = JSON.stringify({ id, ...properties });
    PeopleQueryManager.queries.insertPerson.run(id, data);
  }

  static getPerson(id: string): DatabasePerson | null {
    const row = PeopleQueryManager.queries.getPerson.get(id);
    if (!row) return null;

    const data = JSON.parse(row.data) as DatabasePerson;
    return data;
  }

  static getAllPeople(): DatabasePerson[] {
    const rows = PeopleQueryManager.queries.getAllPeople.all();
    return rows.map(row => JSON.parse(row.data) as DatabasePerson);
  }

  static searchPeople(query: string, limit: number = 10): Array<{id: string, name: string}> {
    const rows = PeopleQueryManager.queries.searchPeople.all(`%${query}%`, limit);
    return rows.map(row => {
      const data = JSON.parse(row.data) as DatabasePerson;
      return { id: data.id, name: data.name };
    });
  }

  static personExists(id: string): boolean {
    return this.getPerson(id) !== null;
  }


  static transformToBasePerson(dbPerson: DatabasePerson): { id: string, name: string } {
    return {
      id: dbPerson.id,
      name: dbPerson.name
    };
  }
}
