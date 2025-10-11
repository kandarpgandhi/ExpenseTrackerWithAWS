const User = require('../models/user')
const sequelize = require('../utils/db-connection')

const addUser = async (req, res) => {
    try {
        const { userName, email, password } = req.body

        const existingUser = await User.findOne({ where: { email } })

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' })
        }
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


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (password != user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = { addUser, loginUser }