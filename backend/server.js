// Import necessary packages
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize the express app
const app = new express();

// Define the port
const PORT = process.env.PORT || 8080;

// A simple test route
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});