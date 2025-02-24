import { Pool } from 'pg';

export interface ILocationCall {
  id: number;
  location_id: string;
  call_id: string;
  created_at: Date;
}

export interface ILocationCallRequest {
  locationId: string;
  callId: string;
}

export class LocationCallModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(data: ILocationCallRequest): Promise<ILocationCall> {
    const query = `
      INSERT INTO location_calls (location_id, call_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [data.locationId, data.callId];
    const result = await this.pool.query<ILocationCall>(query, values);
    return result.rows[0];
  }

  async getCount(locationId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM location_calls 
      WHERE location_id = $1
    `;
    const result = await this.pool.query(query, [locationId]);
    return parseInt(result.rows[0].count);
  }

  async delete(locationId: string, callId: string): Promise<void> {
    const query = `
      DELETE FROM location_calls 
      WHERE location_id = $1 AND call_id = $2
    `;
    await this.pool.query(query, [locationId, callId]);
  }
}

export default LocationCallModel; 