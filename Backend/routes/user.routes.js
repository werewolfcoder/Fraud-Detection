const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction'); // Fix this import
const User = require('../models/User');
const { authenticate, authorizeAdmin } = require('../middleware/auth'); // Import middleware
const { spawn } = require('child_process');
const { Op } = require('sequelize');
const { detectFraud } = require('../services/fraudDetection'); // Fix import
const { getTransactionStats } = require('../controllers/adminController');

// Submit a transaction (only for logged-in users)
router.post("/transaction", authenticate, async (req, res) => {
    try {
        const { amount, transactionType, state, city, bankBranch, recipient, merchantID } = req.body;
        const io = req.app.get('io');
        const adminSockets = req.app.get('adminSockets');

        // Get current user
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.account_balance < parseFloat(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // Prepare transaction data for fraud detection
        const txData = {
            user_id: user.id,
            transaction_amount: parseFloat(amount),
            merchant_category: transactionType === "Bank Transfer" ? "Transfer" : "Payment",
            transaction_type: transactionType === "Bank Transfer" ? "Bank Transfer" : "Online",
            transaction_location: `${city.trim()}, ${state.trim()}`,
            account_balance: user.account_balance,
            transaction_time: new Date()
        };

        // Run fraud detection
        const fraudResult = await detectFraud(txData);
        console.log('Fraud detection result:', fraudResult);

        // Create transaction record with fraud detection results
        const transaction = await Transaction.create({
            ...txData,
            merchant: transactionType === "Bank Transfer" ? 
                     `Transfer to ${recipient}` : 
                     `Payment to ${merchantID}`,
            is_fraud: fraudResult.isFraud,
            fraud_score: fraudResult.fraudScore
        });

        // If fraud detected, notify admins
        if (fraudResult.isFraud) {
            const notificationData = {
                type: 'fraud_alert',
                transaction: {
                    id: transaction.id,
                    amount: transaction.transaction_amount,
                    type: transaction.transaction_type,
                    location: transaction.transaction_location,
                    merchant: transaction.merchant,
                    fraud_score: fraudResult.fraudScore,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    },
                    timestamp: transaction.transaction_time
                }
            };

            // Emit to all admin sockets
            adminSockets.forEach(socket => {
                socket.emit('fraud_alert', notificationData);
            });
        }

        // Update balance only if not fraud
        if (!fraudResult.isFraud) {
            await user.update({
                account_balance: user.account_balance - parseFloat(amount)
            });
        }

        res.status(201).json({
            message: fraudResult.isFraud ? "Transaction flagged as fraudulent" : "Transaction processed successfully",
            data: transaction,
            newBalance: user.account_balance,
            fraud_detection: {
                is_fraud: fraudResult.isFraud,
                fraud_score: fraudResult.fraudScore
            }
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

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const parsedAmount = parseFloat(amount);
        const currentBalance = parseFloat(user.account_balance);

        // Prepare deposit data for fraud detection
        const txData = {
            user_id: user.id,
            transaction_amount: parsedAmount,
            merchant_category: "Deposit",
            transaction_type: "Cash Deposit",
            transaction_location: "Bank Branch",
            account_balance: currentBalance,
            transaction_time: new Date()
        };

        // Run fraud detection
        const fraudResult = await detectFraud(txData);
        console.log('Deposit fraud detection result:', fraudResult);

        // Calculate new balance first
        const newBalance = currentBalance + parsedAmount;

        // Create transaction record
        const transaction = await Transaction.create({
            ...txData,
            merchant: "Self Deposit",
            is_fraud: fraudResult.isFraud,
            fraud_score: fraudResult.fraudScore,
            account_balance: newBalance // Set the new balance in transaction
        });

        // If not fraud, update user's balance
        if (!fraudResult.isFraud) {
            await user.update({
                account_balance: newBalance
            });
            await user.reload(); // Reload user to get updated balance
        }

        // Send response with updated data
        res.status(201).json({
            message: fraudResult.isFraud ? "Deposit flagged as suspicious" : "Deposit successful",
            data: transaction,
            newBalance: user.account_balance,
            fraud_detection: {
                is_fraud: fraudResult.isFraud,
                fraud_score: fraudResult.fraudScore
            }
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

// Helper function for formatting transactions
const formatTransaction = (tx) => {
    const data = tx.get({ plain: true });
    return {
        id: data.id,
        transaction_amount: Number(data.transaction_amount || 0).toFixed(2),
        account_balance: Number(data.account_balance || 0).toFixed(2),
        transaction_time: new Date(data.transaction_time).toISOString(),
        merchant_category: data.merchant_category || 'Uncategorized',
        transaction_type: data.transaction_type || 'Unknown',
        transaction_location: data.transaction_location || 'Unknown Location',
        merchant: data.merchant || 'Unknown Merchant'
    };
};

// Dashboard route
router.get("/dashboard", authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const transactions = await Transaction.findAll({
            where: { user_id: user.id },
            order: [["transaction_time", "DESC"]],
            limit: 10,
            raw: false
        });

        res.status(200).json({
            account_balance: Number(user.account_balance || 0).toFixed(2),
            transactions: transactions.map(formatTransaction)
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
});

// Transactions route
router.get("/transactions", authenticate, async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { user_id: req.user.id },
            order: [["transaction_time", "DESC"]],
            raw: false
        });

        res.status(200).json({
            transactions: transactions.map(formatTransaction)
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
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

// Add this new route for model testing
router.get("/test-model", authenticate, authorizeAdmin, async (req, res) => {
    const { testModel } = require('../controllers/transactionController');
    await testModel(req, res);
});

// Update the route to use an async handler
router.get("/admin/stats", authenticate, authorizeAdmin, async (req, res) => {
    try {
        await getTransactionStats(req, res);
    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

module.exports = router;
