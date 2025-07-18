const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// GET /api/transactions
// Get all transactions for a user
router.get('/', isLoggedIn, async (req, res) => {
  try {
    // Find all transactions that belong to the logged-in user
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 }) // sort by date to show newest first
      .populate('category'); // It replaces the category ID with the actual category object (so we can get its name).

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error while fetching transactions.' });
  }
});

// POST /api/transactions
// Create a new transaction
router.post('/', isLoggedIn, async (req, res) => {
  // Extract data from request
  const { type, description, amount, category: categoryName, date } = req.body;

  // validation
  if (!type || !description || !amount || !categoryName || !date) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    // We need to get the ID of the category.
    // So, we find or create the category for this user.
    let category = await Category.findOne({ name: categoryName, user: req.user._id });

    if (!category) {
      // If the category doesn't exist for this user, create it.
      category = new Category({ name: categoryName, user: req.user._id });
      await category.save();
    }

    // Create a new transaction object
    const newTransaction = new Transaction({
      user: req.user._id, // The ID of the logged-in user
      type,
      description,
      amount,
      date,
      category: category._id // The ID of the found or created category
    });

    // Save the transaction to the database
    const savedTransaction = await newTransaction.save();

    // Send the new transaction back as a response
    res.status(201).json(savedTransaction);

  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Server error while creating transaction.' });
  }
});

module.exports = router;