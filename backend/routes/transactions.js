const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// GET /api/transactions
// Get all transactions for a user with optional filtering
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const { type, category: categoryName, dateRange } = req.query;

    const filter = { user: req.user.id };

    // Apply type filter
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Apply category filter
    if (categoryName && categoryName !== 'all') {
      // Find the category ID from its name
      const category = await Category.findOne({ name: categoryName, user: req.user.id });
      if (category) {
        filter.category = category._id;
      } else {
        // If category doesn't exist for the user, return no transactions
        return res.status(200).json([]);
      }
    }
    
    // Apply date range filter
    if (dateRange && dateRange !== 'all') {
        const startDate = new Date();
        if (dateRange === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (dateRange === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (dateRange === '3months') {
            startDate.setMonth(startDate.getMonth() - 3);
        }
        filter.date = { $gte: startDate };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .populate('category');
      
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/transactions
// Add a new transaction
router.post('/', isLoggedIn, async (req, res) => {
    try {
        const { type, description, amount, date, category: categoryName } = req.body;
        if (!type || !description || !amount || !date || !categoryName) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        let category = await Category.findOne({ name: categoryName, user: req.user.id });
        if (!category) {
            category = new Category({ name: categoryName, user: req.user.id });
            await category.save();
        }

        const newTransaction = new Transaction({
            user: req.user.id,
            type,
            description,
            amount,
            date,
            category: category._id
        });

        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// GET /api/transactions/categories
// Get all unique categories for a user
router.get('/categories', isLoggedIn, async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user.id }).distinct('name');
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error while fetching categories.' });
    }
});

module.exports = router;