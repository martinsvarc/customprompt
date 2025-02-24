import { Pool } from 'pg';

// Types
export interface IPrompt {
  id: number;
  contact_id: string;
  location_id: string;
  custom_prompt: string;
  created_at: Date;
  updated_at: Date;
}

export interface IPromptRequest {
  contactId: string;
  locationId: string;
  customPrompt: string;
}

export class PromptModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(data: IPromptRequest): Promise<IPrompt> {
    const query = `
      INSERT INTO prompts (contact_id, location_id, custom_prompt)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [data.contactId, data.locationId, data.customPrompt];
    const result = await this.pool.query<IPrompt>(query, values);
    return result.rows[0];
  }

  async findOne(contactId: string, locationId: string): Promise<IPrompt | null> {
    const query = `
      SELECT * FROM prompts 
      WHERE contact_id = $1 AND location_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const values = [contactId, locationId];
    const result = await this.pool.query<IPrompt>(query, values);
    return result.rows[0] || null;
  }
}

export default PromptModel;
