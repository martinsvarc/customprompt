const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  contactId: {
    type: String,
    required: true
  },
  locationId: {
    type: String,
    required: true
  },
  customPrompt: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Compound index for faster queries
promptSchema.index({ contactId: 1, locationId: 1 });

module.exports = mongoose.model('Prompt', promptSchema); 