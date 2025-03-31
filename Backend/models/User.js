const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Username is required' },
            len: {
                args: [2, 50],
                msg: 'Username must be between 2 and 50 characters'
            }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            msg: 'Email already exists'
        },
        validate: {
            notEmpty: { msg: 'Email is required' },
            isEmail: { msg: 'Please enter a valid email address' }
        }
    },
    password: {
        type: DataTypes.STRING(60), // For bcrypt hash
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Password is required' },
            len: {
                args: [6, 100],
                msg: 'Password must be at least 6 characters long'
            }
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    last_login: {
        type: DataTypes.DATE
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true
    },
    contact: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    account_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 1000.00,  // Starting balance for new users
        validate: {
            min: { 
                args: [0],
                msg: 'Balance cannot be negative'
            }
        }
    }
}, {
    tableName: 'users', // Ensure the table name is lowercase
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['email']
        }
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

User.associate = (models) => {
    User.hasMany(models.Transaction, {
        foreignKey: 'user_id',
        as: 'transactions'
    });
};

module.exports = User;