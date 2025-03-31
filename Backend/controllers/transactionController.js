const { Transaction } = require('../models/Transaction');
const { User } = require('../models/User');
const { detectFraud } = require('../services/fraudDetection');

async function processTransaction(req, res) {
    try {
        const { user_id, transaction_amount, merchant_category, transaction_type } = req.body;
        
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const txData = {
            user_id,
            transaction_amount,
            merchant_category,
            transaction_type,
            transaction_location: req.body.transaction_location || 'Unknown',
            account_balance: user.account_balance,
            transaction_time: new Date()
        };

        // Detect fraud
        const fraudResult = await detectFraud(txData);

        // Create transaction record
        const transaction = await Transaction.create({
            ...txData,
            is_fraud: fraudResult.isFraud,
            fraud_score: fraudResult.fraudScore
        });

        // Update user balance if not fraud
        if (!fraudResult.isFraud) {
            await user.update({
                account_balance: user.account_balance - parseFloat(transaction_amount)
            });
        }

        res.status(200).json({
            success: true,
            transaction_id: transaction.id,
            fraud_score: fraudResult.fraudScore,
            is_fraud: fraudResult.isFraud
        });

    } catch (error) {
        console.error('Transaction processing error:', error);
        res.status(500).json({ 
            error: 'Transaction processing failed',
            details: error.message 
        });
    }
}

async function testModel(req, res) {
    try {
        const startTime = Date.now();
        
        // Test case data
        const testCases = [
            {
                user_id: 1,
                transaction_amount: 10000,
                merchant_category: 'Electronics',
                transaction_type: 'Online',
                transaction_location: 'Remote',
                account_balance: 15000,
                transaction_time: new Date()
            },
            {
                user_id: 1,
                transaction_amount: 50,
                merchant_category: 'Groceries',
                transaction_type: 'POS',
                transaction_location: 'Local Store',
                account_balance: 15000,
                transaction_time: new Date()
            }
        ];

        const results = [];
        for (const testCase of testCases) {
            const fraudResult = await detectFraud(testCase);
            results.push({
                testCase,
                prediction: {
                    fraudScore: fraudResult.fraudScore,
                    isFraud: fraudResult.isFraud,
                    features: fraudResult.features
                }
            });
        }

        const endTime = Date.now();
        
        res.status(200).json({
            success: true,
            executionTimeMs: endTime - startTime,
            modelStatus: 'working',
            results,
            summary: {
                totalTests: results.length,
                fraudDetected: results.filter(r => r.prediction.isFraud).length,
                avgPredictionTime: (endTime - startTime) / results.length
            }
        });

    } catch (error) {
        console.error('Model testing error:', error);
        res.status(500).json({
            error: 'Model testing failed',
            details: error.message,
            modelStatus: 'error',
            errorType: error.name,
            errorLocation: 'testModel'
        });
    }
}

module.exports = { 
    processTransaction,
    testModel 
};
