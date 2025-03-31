const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { Op, Sequelize } = require('sequelize');
const moment = require('moment');

const getTransactionStats = async (req, res) => {
  try {
    const sequelize = Transaction.sequelize;
    const startDate = moment().subtract(30, 'days').toDate();

    const [
      dailyStats,
      fraudStats,
      volumeStats,
      categoryStats,
      locationStats,
      userStats,
      summaryStats
    ] = await Promise.all([
      // Daily transaction stats
      Transaction.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('transaction_time')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('transaction_amount')), 'total_amount']
        ],
        where: {
          transaction_time: {
            [Op.gte]: startDate
          }
        },
        group: ['date'],
        order: [['date', 'ASC']]
      }),

      // Fraud statistics
      Transaction.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('transaction_time')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'fraud_count'],
          [sequelize.fn('AVG', sequelize.col('fraud_score')), 'avg_fraud_score']
        ],
        where: {
          is_fraud: true,
          transaction_time: {
            [Op.gte]: startDate
          }
        },
        group: ['date']
      }),

      // Transaction volume by hour
      Transaction.findAll({
        attributes: [
          [sequelize.literal('EXTRACT(HOUR FROM transaction_time)'), 'hour'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.literal('EXTRACT(HOUR FROM transaction_time)')],
        order: [[sequelize.literal('EXTRACT(HOUR FROM transaction_time)'), 'ASC']]
      }),

      // Category distribution
      Transaction.findAll({
        attributes: [
          'merchant_category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('transaction_amount')), 'total_amount']
        ],
        group: ['merchant_category']
      }),

      // Location-based analysis
      Transaction.findAll({
        attributes: [
          'transaction_location',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('AVG', sequelize.col('fraud_score')), 'avg_fraud_score']
        ],
        group: ['transaction_location'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10
      }),

      // User transaction patterns
      User.findAll({
        attributes: [
          'id',
          'username',
          // Count and sum aggregated on joined transactions (using the alias "transactions")
          [sequelize.fn('COUNT', sequelize.col('transactions.id')), 'transaction_count'],
          [sequelize.fn('SUM', sequelize.col('transactions.transaction_amount')), 'total_amount']
        ],
        include: [{
          model: Transaction,
          as: 'transactions', // This alias must match your association in the model definition
          attributes: []
        }],
        group: ['User.id', 'User.username'],
        // Order by the aggregated alias "transaction_count"
        order: [[sequelize.literal('"transaction_count"'), 'DESC']],
        limit: 10,
        subQuery: false // Optionally disable subqueries if needed
      }),

      // Summary stats: total transactions, total fraudulent, total users, and total transaction volume
      Promise.all([
        Transaction.count(),
        Transaction.count({ where: { is_fraud: true } }),
        User.count({ where: { role: 'user' } }),
        Transaction.sum('transaction_amount')
      ])
    ]);

    // Extract summary stats
    const [totalTransactions, totalFraudulent, totalUsers, totalVolume] = summaryStats;

    res.json({
      dailyStats: dailyStats.map(stat => ({
        date: stat.get('date'),
        count: parseInt(stat.get('count')),
        total_amount: parseFloat(stat.get('total_amount') || 0)
      })),
      fraudStats: fraudStats.map(stat => ({
        date: stat.get('date'),
        fraud_count: parseInt(stat.get('fraud_count')),
        avg_fraud_score: parseFloat(stat.get('avg_fraud_score') || 0)
      })),
      volumeStats: volumeStats.map(stat => ({
        hour: parseInt(stat.get('hour')),
        count: parseInt(stat.get('count'))
      })),
      categoryStats,
      locationStats,
      userStats: userStats.map(user => ({
        id: user.id,
        username: user.username,
        transaction_count: parseInt(user.getDataValue('transaction_count') || 0),
        total_amount: parseFloat(user.getDataValue('total_amount') || 0)
      })),
      summary: {
        totalTransactions,
        totalUsers,
        totalFraudulent,
        totalVolume: totalVolume || 0,
        fraudRate: totalTransactions ? ((totalFraudulent / totalTransactions) * 100).toFixed(2) : '0.00'
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error.message
    });
  }
};

module.exports = { getTransactionStats };
