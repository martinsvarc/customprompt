const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Database test route
app.get('/api/dbtest', async (req, res) => {
  try {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Database connected',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 