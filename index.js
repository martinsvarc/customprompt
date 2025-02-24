const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Prompt = require('./models/Prompt');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// POST endpoint to save prompt
app.post('/api/prompts', async (req, res) => {
  try {
    const { contactId, locationId, customPrompt } = req.body;
    const prompt = new Prompt({ contactId, locationId, customPrompt });
    await prompt.save();
    res.status(201).json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET endpoint to retrieve prompt
app.get('/api/prompts', async (req, res) => {
  try {
    const { contactId, locationId } = req.query;
    const prompt = await Prompt.findOne({ contactId, locationId });
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    res.json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 