const Transaction = require('../models/Transaction');  // Fix the import
const { spawn } = require('child_process');
const { Op } = require('sequelize');
const moment = require('moment');
const path = require('path'); // Add path module

async function getTransactionContext(userId, currentTime, lookback = 5) {
    try {
        const transactions = await Transaction.findAll({
            where: {
                user_id: userId,
                transaction_time: { [Op.lt]: currentTime }
            },
            order: [['transaction_time', 'DESC']],
            limit: lookback,
            attributes: [
                'transaction_amount',
                'merchant_category',
                'transaction_time',
                'is_fraud'
            ],
            raw: true
        });
        return transactions;
    } catch (error) {
        console.error('Error getting transaction context:', error);
        return [];
    }
}

function calculateFeatures(newTx, historicalTx) {
    // Base features
    const features = {
        transaction_amount: parseFloat(newTx.transaction_amount),
        account_balance: parseFloat(newTx.account_balance),
        merchant_category: newTx.merchant_category,
        transaction_type: newTx.transaction_type,
        transaction_hour: moment(newTx.transaction_time).hour(),
        transaction_location: newTx.transaction_location
    };

    // Add historical context
    if (historicalTx.length > 0) {
        const txAmounts = historicalTx.map(t => parseFloat(t.transaction_amount));
        const fraudCount = historicalTx.filter(t => t.is_fraud).length;
        
        features.avg_amount_24h = txAmounts.reduce((a, b) => a + b, 0) / txAmounts.length;
        features.fraud_ratio = fraudCount / historicalTx.length;
        features.tx_frequency_24h = historicalTx.filter(t => 
            moment(t.transaction_time).isAfter(moment().subtract(24, 'hours'))
        ).length;
    } else {
        features.avg_amount_24h = 0;
        features.fraud_ratio = 0;
        features.tx_frequency_24h = 0;
    }

    return features;
}

async function detectFraud(transactionData) {
    try {
        console.log('\n**************** FRAUD DETECTION START ****************');
        console.log('Transaction Details:', JSON.stringify({
            user_id: transactionData.user_id,
            amount: transactionData.transaction_amount,
            type: transactionData.transaction_type,
            location: transactionData.transaction_location,
            time: transactionData.transaction_time
        }, null, 2));

        // Get historical context
        const historicalTx = await getTransactionContext(
            transactionData.user_id,
            transactionData.transaction_time
        ).catch(err => {
            console.error('Error getting transaction context:', err);
            return []; // Return empty array on error
        });
        console.log('\n[Historical Transactions]');
        console.log(`Total found: ${historicalTx.length}`);
        console.log('Recent transactions:', JSON.stringify(historicalTx.slice(0, 2), null, 2));

        // Calculate features
        const features = calculateFeatures(transactionData, historicalTx);
        console.log('\n[Calculated Features]');
        console.log(JSON.stringify(features, null, 2));

        // Update Python script path to use absolute path
        const pythonScriptPath = path.join(process.cwd(), 'mlModels', 'predict.py');
        console.log('Python script path:', pythonScriptPath);

        // Call Python script for prediction
        console.log('\n[Calling Python Model]');
        
        // Default result in case of model failure
        let result = {
            fraudScore: 0.1,
            isFraud: false,
            features
        };

        try {
            const prediction = await new Promise((resolve, reject) => {
                const pythonProcess = spawn('python', [pythonScriptPath]);
                let dataString = '';
                let errorString = '';

                pythonProcess.stdout.on('data', (data) => {
                    dataString += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    errorString += data.toString();
                });

                pythonProcess.on('close', (code) => {
                    if (code !== 0) {
                        return reject(new Error(errorString));
                    }
                    try {
                        // Extract only the JSON part from the output
                        const jsonStr = dataString.split('\n').find(line => line.trim().startsWith('{'));
                        const result = JSON.parse(jsonStr);
                        resolve(result);
                    } catch (e) {
                        reject(new Error(`Failed to parse Python output: ${e.message}`));
                    }
                });

                pythonProcess.stdin.write(JSON.stringify(features));
                pythonProcess.stdin.end();
            });
            
            result = {
                fraudScore: prediction.fraud_probability,
                isFraud: prediction.fraud_probability > 0.5,
                features
            };
        } catch (modelError) {
            console.error('Model prediction failed:', modelError);
            return {
                fraudScore: 0.1,
                isFraud: false,
                features
            };
        }

        console.log('\n[Final Result]:', JSON.stringify(result, null, 2));
        console.log('**************** FRAUD DETECTION END ****************\n');
        return result;

    } catch (error) {
        console.error('\n**************** FRAUD DETECTION ERROR ****************');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        console.error('Transaction:', JSON.stringify(transactionData, null, 2));
        console.error('**************** FRAUD DETECTION ERROR END ****************\n');
        throw error;
    }
}

async function testModelPrediction() {
    const testCase = {
        user_id: 1,
        transaction_amount: 10000,
        merchant_category: 'Electronics',
        transaction_type: 'Online',
        transaction_location: 'Remote Location',
        account_balance: 5000,
        transaction_time: new Date()
    };

    try {
        const result = await detectFraud(testCase);
        console.log('Test prediction result:', result);
        return result;
    } catch (error) {
        console.error('Test prediction failed:', error);
        throw error;
    }
}

module.exports = { 
    detectFraud,
    testModelPrediction
};
