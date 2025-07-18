// Import necessary packages
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const session = require('express-session'); // For managing user sessions
const passport = require('passport');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

require('./config/passport-setup'); 

// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

// Initialize the express app
const app = express();

// Middleware Setup
app.use(express.json()); 
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true // Allow cookies to be sent
}));

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Passport Middleware
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Allow Passport to use sessions

// Database Connection Logic
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/personal-finance';

mongoose.connect(DATABASE_URL)
  .then(() => console.log('Successfully connected to local MongoDB!'))
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  });

// API Routes
app.use('/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

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