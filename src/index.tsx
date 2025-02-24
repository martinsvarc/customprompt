import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Root route
app.get('/', async (_req: Request, res: Response) => {
  try {
    res.status(200).json({ message: 'API is running' });
  } catch (error) {
    console.error('Root route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test route
app.get('/api/test', async (_req: Request, res: Response) => {
  try {
    res.status(200).json({ 
      message: 'API test endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Database test route
app.get('/api/dbtest', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ 
      message: 'Database connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Types
interface Prompt {
  id: number;
  contact_id: string;
  location_id: string;
  custom_prompt: string;
  created_at: Date;
  updated_at: Date;
}

interface PromptRequest {
  contactId: string;
  locationId: string;
  customPrompt: string;
}

// POST endpoint to save prompt
app.post('/api/prompts', async (req: Request<{}, {}, PromptRequest>, res: Response) => {
  try {
    const { contactId, locationId, customPrompt } = req.body;
    
    if (!contactId || !locationId || !customPrompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO prompts (contact_id, location_id, custom_prompt)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [contactId, locationId, customPrompt];
    const result = await pool.query<Prompt>(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving prompt:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// GET endpoint to retrieve prompt
app.get('/api/prompts', async (req: Request, res: Response) => {
  try {
    const { contactId, locationId } = req.query;
    
    if (!contactId || !locationId) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    const query = `
      SELECT * FROM prompts 
      WHERE contact_id = $1 AND location_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const values = [contactId, locationId];
    const result = await pool.query<Prompt>(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error retrieving prompt:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Error handling middleware
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app; 