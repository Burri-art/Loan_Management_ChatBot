const express = require('express');
const bodyParser = require('body-parser');
const openai = require('openai'); // Import OpenAI SDK v2 or below
require('dotenv').config();
const { createTables, applyForLoan, getLoansByUserId } = require('./database');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// OpenAI setup for version 2.x and earlier
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is missing from environment variables.');
  process.exit(1); // Exit the app if the API key is missing
}
openai.apiKey = process.env.OPENAI_API_KEY;

// Create tables if they don't exist (separate function can be made async)
createTables();

// Function for standardized responses
const sendResponse = (res, statusCode, message, data = {}) => {
  res.status(statusCode).json({
    success: statusCode === 200,
    message,
    data
  });
};

// Apply for a loan
app.post('/apply-loan', async (req, res) => {
  const { amount } = req.body;

  // Validate input
  if (!amount) {
    return sendResponse(res, 400, 'Loan amount is required.');
  }

  // Simplified: Using a default user ID (e.g., 1)
  const userId = 1;

  try {
    const loanId = await new Promise((resolve, reject) => {
      applyForLoan(userId, amount, (err, loanId) => {
        if (err) reject(err);
        resolve(loanId);
      });
    });
    sendResponse(res, 200, 'Loan application submitted successfully!', { loanId });
  } catch (error) {
    console.error('Error applying for loan:', error);
    sendResponse(res, 500, 'Error applying for loan.');
  }
});

// Check loan status
app.get('/loan-status', async (req, res) => {
  // Simplified: Using a default user ID (e.g., 1)
  const userId = 1;

  try {
    const loans = await new Promise((resolve, reject) => {
      getLoansByUserId(userId, (err, loans) => {
        if (err) reject(err);
        resolve(loans);
      });
    });

    if (loans.length === 0) {
      return sendResponse(res, 404, 'No loan found.');
    }

    const loanDetails = loans.map((loan) => ({
      loanId: loan.id,
      amount: loan.amount,
      status: loan.status,
      createdAt: loan.created_at,
    }));

    sendResponse(res, 200, 'Loan status retrieved successfully!', { loans: loanDetails });
  } catch (error) {
    console.error('Error fetching loan data:', error);
    sendResponse(res, 500, 'Error fetching loan data.');
  }
});

// Chatbot route (OpenAI API interaction)
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  // Validate user message
  if (!userMessage || userMessage.trim() === '') {
    return sendResponse(res, 400, 'Message is required.');
  }

  try {
    const response = await openai.Completion.create({
      engine: 'davinci',  // Use the appropriate engine
      prompt: `You are a helpful chatbot for microfinance support. User: ${userMessage}`,
      max_tokens: 150, // Limit tokens to prevent excessive cost
    });

    const botReply = response.choices[0].text.trim(); // Accessing the response text
    sendResponse(res, 200, 'Chatbot response generated successfully!', { reply: botReply });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    sendResponse(res, 500, 'An error occurred while generating a response.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
