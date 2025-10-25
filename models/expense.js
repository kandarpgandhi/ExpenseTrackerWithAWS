const { DataTypes } = require('sequelize')
const sequelize = require('../utils/db-connection')
const User = require('./user');
const Expense = sequelize.define('ExpenseTable', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, note: {                              // 👈 NEW FIELD
        type: DataTypes.STRING,
        allowNull: true,
    }
},
    {
        tableName: 'ExpenseTable',  // 👈 THIS IS IMPORTANT
        timestamps: true

    })

User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });


module.exports = Expense