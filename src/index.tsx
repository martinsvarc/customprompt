import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import PromptModel, { IPromptRequest } from './models/Prompt';
import LocationCallModel, { ILocationCallRequest } from './models/LocationCall';

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

// Initialize Prompt model
const promptModel = new PromptModel(pool);

// Initialize LocationCall model
const locationCallModel = new LocationCallModel(pool);

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

// POST endpoint to save prompt
app.post('/api/prompts', async (req: Request<{}, {}, IPromptRequest>, res: Response) => {
  try {
    const { contactId, locationId, customPrompt } = req.body;
    
    if (!contactId || !locationId || !customPrompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = await promptModel.create({
      contactId,
      locationId,
      customPrompt
    });
    
    res.status(201).json(prompt);
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
    const contactId = req.query.contactId as string;
    const locationId = req.query.locationId as string;
    
    if (!contactId || !locationId) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    const prompt = await promptModel.findOne(contactId, locationId);
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    res.json(prompt);
  } catch (error) {
    console.error('Error retrieving prompt:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// GET endpoint to get call count for a location
app.get('/api/location-calls', async (req: Request, res: Response) => {
  try {
    const locationId = req.query.locationId as string;
    
    if (!locationId) {
      return res.status(400).json({ error: 'Missing locationId parameter' });
    }

    const count = await locationCallModel.getCount(locationId);
    res.json({ count });
  } catch (error) {
    console.error('Error getting location call count:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// POST endpoint to create location-call relationship
app.post('/api/location-calls', async (req: Request<{}, {}, ILocationCallRequest>, res: Response) => {
  try {
    const { locationId, callId } = req.body;
    
    if (!locationId || !callId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const locationCall = await locationCallModel.create({
      locationId,
      callId
    });
    
    res.status(201).json(locationCall);
  } catch (error) {
    console.error('Error creating location-call relationship:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// DELETE endpoint to remove location-call relationship
app.delete('/api/location-calls', async (req: Request, res: Response) => {
  try {
    const { locationId, callId } = req.body;
    
    if (!locationId || !callId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await locationCallModel.delete(locationId, callId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting location-call relationship:', error);
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