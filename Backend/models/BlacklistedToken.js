const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true }, // The blacklisted token
    createdAt: { type: Date, default: Date.now, expires: '1h' }, // Automatically delete after 1 hour
});

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);