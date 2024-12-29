const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { OpenAI } = require('openai');  
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./microfinance.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// OpenAI setup for v3.x (removed Configuration and OpenAIApi, using OpenAI directly)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Store your OpenAI API key in a .env file
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
