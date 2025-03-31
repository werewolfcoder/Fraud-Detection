const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { authenticate, authorizeAdmin } = require('../middleware/auth'); // Import middleware
const { spawn } = require('child_process');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

// Submit a transaction (only for logged-in users)
router.post("/transaction", authenticate, async (req, res) => {
    try {
        const { amount, transactionType, state, city, bankBranch, recipient, merchantID } = req.body;

        // Get current user
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if user has sufficient balance
        if (user.account_balance < parseFloat(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // Update user's balance
        await user.update({
            account_balance: user.account_balance - parseFloat(amount)
        });

        // Create transaction record
        let merchant = null;
        if (transactionType === "Bank Transfer") {
            if (!recipient) {
                return res.status(400).json({ error: "Recipient information is required for Bank Transfer" });
            }
            merchant = `Transfer to ${recipient}`;
        } else if (transactionType === "Merchant Payment") {
            if (!merchantID) {
                return res.status(400).json({ error: "Merchant ID is required for Merchant Payment" });
            }
            merchant = `Payment to ${merchantID}`;
        }

        const location = `${city.trim()}, ${state.trim()}`;

        const transaction = await Transaction.create({
            user_id: req.user.id,
            amount: parseFloat(amount),
            merchant,
            location,
            transaction_date: new Date(),
            is_fraud: false,
            fraud_score: 0.0,
        });

        res.status(201).json({ 
            message: "Transaction created successfully", 
            data: transaction,
            newBalance: user.account_balance
        });
    } catch (error) {
        console.error("Transaction error:", error);
        res.status(500).json({ error: "Transaction failed", details: error.message });
    }
});

// Handle deposits
router.post("/deposit", authenticate, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: "Please provide a valid amount" });
        }

        // Get current user
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const parsedAmount = parseFloat(amount);

        // Update user's balance
        await user.update({
            account_balance: parseFloat(user.account_balance) + parsedAmount
        });

        // Create transaction record
        const transaction = await Transaction.create({
            user_id: req.user.id,
            amount: parsedAmount,
            merchant: "Cash Deposit",
            location: "Self Deposit",
            transaction_date: new Date(),
            is_fraud: false,
            fraud_score: 0.0,
        });

        res.status(201).json({ 
            message: "Deposit successful", 
            data: transaction,
            newBalance: user.account_balance
        });
    } catch (error) {
        console.error("Deposit error:", error);
        res.status(500).json({ error: "Deposit failed", details: error.message });
    }
});

// Get fraud transactions (only for admins)
router.get("/fraud-transactions", authenticate, authorizeAdmin, async (req, res) => {
    try {
        const fraudTransactions = await Transaction.find({ is_fraud: true });
        res.status(200).json({ data: fraudTransactions });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Dashboard route to fetch account balance and recent transactions
router.get("/dashboard", authenticate, async (req, res) => {
    try {
        // Fetch complete user data from database
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch recent transactions for the user
        const transactions = await Transaction.findAll({
            where: { user_id: user.id },
            order: [["transaction_date", "DESC"]],
            limit: 10,
            attributes: ['id', 'amount', 'merchant', 'transaction_date', 'location']
        });

        // Send response
        res.status(200).json({
            account_balance: user.account_balance,
            transactions: transactions.map(t => t.toJSON())
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
});

// Update user profile
router.put("/profile", authenticate, async (req, res) => {
    try {
        const { username, email, contact, age, gender } = req.body;
        
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update only provided fields
        const updates = {};
        if (username) updates.username = username.trim();
        if (email) updates.email = email.trim().toLowerCase();
        if (contact) updates.contact = contact.trim();
        if (age) updates.age = parseInt(age);
        if (gender) updates.gender = gender;

        await user.update(updates);

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                age: user.age,
                gender: user.gender,
                contact: user.contact,
                account_balance: user.account_balance
            }
        });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ error: "Failed to update profile", details: error.message });
    }
});

async function predictWithPython(features) {
    return new Promise((resolve, reject) => {
        const python = spawn('python', ['predict.py']);
        let output = '';

        // Send features to Python
        python.stdin.write(JSON.stringify(features));
        python.stdin.end();

        // Receive output
        python.stdout.on('data', (data) => output += data);
        python.stderr.on('data', (data) => reject(data.toString()));

        python.on('close', (code) => {
            if (code !== 0) return reject();
            resolve(JSON.parse(output));
        });
    });
}


router.post('/predict', async (req, res) => {
    const context = await getContext(req.body.user_id);
    const features = prepareFeatures(req.body, context);
    
    try {
        const prediction = await predictWithPython(features);
        
        // Store transaction
        db.run(
            `INSERT INTO transactions (...) VALUES (...)`,
            [...prediction.is_fraud],
            function(err) {
                res.json({ prediction });
            }
        );
    } catch (err) {
        res.status(500).send("Prediction failed");
    }
});

// Admin Analytics Routes
router.get("/admin/analytics", authenticate, authorizeAdmin, async (req, res) => {
    try {
        // Use sequelize.literal for raw SQL functions
        const sequelize = User.sequelize;
        
        const [
            totalTransactions,
            fraudulentTransactions,
            totalUsers,
            totalBalance,
            recentTransactions,
            userStats,
            dailyRevenue
        ] = await Promise.all([
            Transaction.count(),
            Transaction.count({ where: { is_fraud: true } }),
            User.count({ where: { role: 'user' } }),
            User.sum('account_balance'),
            
            // Recent high-value transactions
            Transaction.findAll({
                limit: 5,
                order: [[sequelize.literal('amount'), 'DESC']],
                include: [{
                    model: User,
                    attributes: ['username'],
                    as: 'user'
                }],
                attributes: ['id', 'amount', 'transaction_date', 'merchant']
            }),
            
            // User statistics
            User.findAll({
                where: { role: 'user' },
                attributes: [
                    'id',
                    'username',
                    'account_balance',
                    [sequelize.literal('(SELECT COUNT(*) FROM "Transactions" WHERE "Transactions"."user_id" = "User"."id")'), 'transaction_count']
                ],
                order: [[sequelize.literal('transaction_count'), 'DESC']],
                limit: 5
            }),

            // Daily revenue/transaction volume
            Transaction.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('transaction_date')), 'date'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: {
                    transaction_date: {
                        [Op.gte]: sequelize.literal('CURRENT_DATE - INTERVAL \'7 days\'')
                    }
                },
                group: [sequelize.fn('DATE', sequelize.col('transaction_date'))],
                order: [[sequelize.fn('DATE', sequelize.col('transaction_date')), 'DESC']]
            })
        ]);

        res.status(200).json({
            summary: {
                totalTransactions,
                fraudulentTransactions,
                totalUsers,
                totalBalance: totalBalance || 0,
                fraudRate: totalTransactions ? ((fraudulentTransactions / totalTransactions) * 100).toFixed(2) : '0.00'
            },
            recentTransactions: recentTransactions.map(tx => ({
                ...tx.toJSON(),
                username: tx.user?.username
            })),
            topUsers: userStats.map(user => ({
                ...user.toJSON(),
                transaction_count: parseInt(user.getDataValue('transaction_count') || 0)
            })),
            dailyRevenue: dailyRevenue.map(day => ({
                date: day.getDataValue('date'),
                total_amount: parseFloat(day.getDataValue('total_amount') || 0),
                count: parseInt(day.getDataValue('count') || 0)
            }))
        });
    } catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({ 
            error: "Failed to fetch analytics",
            details: error.message
        });
    }
});

module.exports = router;
