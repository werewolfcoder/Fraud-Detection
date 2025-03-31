const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transaction = sequelize.define('Transaction', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    transaction_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        get() {
            const value = this.getDataValue('transaction_amount');
            return value === null ? "0.00" : Number(value).toFixed(2);
        }
    },
    account_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        get() {
            const value = this.getDataValue('account_balance');
            return value === null ? "0.00" : Number(value).toFixed(2);
        }
    },
    transaction_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        get() {
            const value = this.getDataValue('transaction_time');
            return value ? new Date(value).toISOString() : new Date().toISOString();
        }
    },
    merchant_category: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    transaction_type: {
        type: DataTypes.ENUM('Online', 'POS', 'ATM', 'Bank Transfer', 'Cash Deposit'),
        allowNull: false
    },
    transaction_location: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Unknown Location',
        get() {
            const rawValue = this.getDataValue('transaction_location');
            return rawValue || 'Unknown Location';
        }
    },
    merchant: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    is_fraud: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    fraud_score: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    }
}, {
    indexes: [
        { fields: ['user_id'] },
        { fields: ['transaction_time'] },
        { fields: ['merchant'] }
    ]
});

Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });
};

module.exports = Transaction;