// Import necessary packages
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from .env file
dotenv.config();

// Initialize the express app
const app = express();

// Database Connection Logic
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/personal-finance';

mongoose.connect(DATABASE_URL)
  .then(() => {
    console.log('Successfully connected to local MongoDB!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  });

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