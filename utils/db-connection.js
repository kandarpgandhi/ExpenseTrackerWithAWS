const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('expensemanagement', 'root', 'bakor@11', {
    host: 'localhost',
    dialect: 'mysql'
});
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been made')
    } catch (err) {
        console.log(err)
    }
})

module.exports = sequelize