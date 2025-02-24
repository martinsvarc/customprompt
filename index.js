const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// POST endpoint to save prompt
app.post('/api/prompts', async (req, res) => {
  try {
    const { contactId, locationId, customPrompt } = req.body;
    const query = `
      INSERT INTO prompts (contact_id, location_id, custom_prompt)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [contactId, locationId, customPrompt];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving prompt:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET endpoint to retrieve prompt
app.get('/api/prompts', async (req, res) => {
  try {
    const { contactId, locationId } = req.query;
    const query = `
      SELECT * FROM prompts 
      WHERE contact_id = $1 AND location_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const values = [contactId, locationId];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error retrieving prompt:', error);
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 