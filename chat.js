// Chatbot route
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or the model you'd like to use
      messages: [
        { role: 'system', content: 'You are a helpful chatbot for microfinance support.' },
        { role: 'user', content: userMessage },
      ],
    });

    const botReply = response.choices[0].message.content;
    res.json({ reply: botReply });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    res.status(500).json({ error: 'An error occurred while generating a response.' });
  }
});
