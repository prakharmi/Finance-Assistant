const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// GET /api/analytics/summary
// Get a summary of total income, expenses, and net savings.
router.get('/summary', isLoggedIn, async (req, res) => {
    try {
        const summary = await Transaction.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const result = { totalIncome: 0, totalExpense: 0, netSavings: 0 };
        summary.forEach(item => {
            if (item._id === 'income') result.totalIncome = item.totalAmount;
            else if (item._id === 'expense') result.totalExpense = item.totalAmount;
        });
        result.netSavings = result.totalIncome - result.totalExpense;
        res.json(result);
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;