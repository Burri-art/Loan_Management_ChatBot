// index.js
const express = require('express');
const bodyParser = require('body-parser');
const openai = require('openai');  // Import OpenAI SDK v2 or below
require('dotenv').config();
const { createTables, applyForLoan, getLoansByUserId } = require('./database');

const app = express();
app.use(bodyParser.json());

// OpenAI setup for version 2.x and earlier
openai.apiKey = process.env.OPENAI_API_KEY; // Use your OpenAI API key stored in .env

// Create tables if they don't exist
createTables();

// Apply for a loan
app.post('/apply-loan', (req, res) => {
  const { amount } = req.body;

  // Validate input
  if (!amount) {
    return res.status(400).json({ error: 'Loan amount is required.' });
  }

  // Simplified: Using a default user ID (e.g., 1)
  const userId = 1;

  applyForLoan(userId, amount, (err, loanId) => {
    if (err) {
      return res.status(500).json({ error: 'Error applying for loan.' });
    }
    res.json({
      message: 'Loan application submitted successfully!',
      loanId,
    });
  });
});

// Check loan status
app.get('/loan-status', (req, res) => {
  // Simplified: Using a default user ID (e.g., 1)
  const userId = 1;

  getLoansByUserId(userId, (err, loans) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching loan data.' });
    }
    if (loans.length === 0) {
      return res.status(404).json({ message: 'No loan found.' });
    }
    res.json({
      loans: loans.map((loan) => ({
        loanId: loan.id,
        amount: loan.amount,
        status: loan.status,
        createdAt: loan.created_at,
      })),
    });
  });
});

// Chatbot route (OpenAI API interaction)
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    // OpenAI API call in version 2.x
    const response = await openai.Completion.create({
      engine: 'davinci',  // Use the appropriate engine, e.g., davinci, curie, etc.
      prompt: `You are a helpful chatbot for microfinance support. User: ${userMessage}`,
      max_tokens: 150,  // Limit tokens to prevent excessive cost
    });

    const botReply = response.choices[0].text.trim();  // Accessing the response text

    res.json({ reply: botReply });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    res.status(500).json({ error: 'An error occurred while generating a response.' });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
