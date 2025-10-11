const User = require('../models/user')
const sequelize = require('../utils/db-connection')

const addUser = async (req, res) => {
    try {
        const { userName, email, password } = req.body
        const user = await User.create({
            userName: userName,
            email: email,
            password: password,
        })
        res.status(201).send('User added')
    } catch (err) {
        res.status(500).send(err)
    }
}



module.exports = { addUser }