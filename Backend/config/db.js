const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const connectDB = async () => {
    try {
        // Validate database configuration
        if (!process.env.POSTGRES_PASSWORD) {
            throw new Error('Database password not configured in environment variables');
        }
        
        await sequelize.authenticate();
        console.log('Database connection authenticated');

        // Initialize model associations
        const User = require('../models/User');
        const Transaction = require('../models/Transaction');
        const BlacklistedToken = require('../models/BlacklistedToken');
        
        // Set up associations
        User.associate({ Transaction });
        Transaction.associate({ User });

        // Sync database with { alter: true } to update schema
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully');

    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };