const { DataTypes, INTEGER } = require('sequelize')
const sequelize = require('../utils/db-connection')

const User = sequelize.define('userforexpenseapp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
    ,
    isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ///////////////added new///////////////////
    totalExpenseOfUser: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
    ////////////////////////////////////////
})

module.exports = User