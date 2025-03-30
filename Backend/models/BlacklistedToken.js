const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');

const BlacklistedToken = sequelize.define('BlacklistedToken', {
    token: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true,
    indexes: [{
        fields: ['createdAt'],
        using: 'BTREE'
    }]
});

// Clean up old tokens periodically
setInterval(async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await BlacklistedToken.destroy({
        where: {
            createdAt: {
                [Op.lt]: oneHourAgo
            }
        }
    });
}, 60 * 60 * 1000); // Run every hour

module.exports = BlacklistedToken;