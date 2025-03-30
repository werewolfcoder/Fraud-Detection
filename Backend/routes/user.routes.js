const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { authenticate, authorizeAdmin } = require('../middleware/auth'); // Import middleware
const { spawn } = require('child_process');
// Submit a transaction (only for logged-in users)
router.post("/transaction", authenticate, async (req, res) => {
    try {
        const transactionData = req.body;

        // Simulate AI fraud analysis with dummy data
        const riskScore = Math.random() * 100; // Generate a random fraud score between 0 and 100
        transactionData.is_fraud = riskScore > 70; // Flag as fraud if riskScore > 70
        transactionData.fraud_score = riskScore;

        // Save the transaction to the database
        const transaction = new Transaction(transactionData);
        await transaction.save();

        res.status(201).json({
            message: transactionData.is_fraud ? "Fraud detected" : "Transaction processed",
            data: transaction
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
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

module.exports = router;
