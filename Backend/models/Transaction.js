const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    amount: { type: Number, required: true },
    merchant: { type: String, required: true },
    location: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    is_fraud: { type: Boolean, default: false },
    fraud_score: { type: Number, default: 0 }
});

module.exports = mongoose.model('Transaction', transactionSchema);