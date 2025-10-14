const User = require('../models/user')
const sequelize = require('../utils/db-connection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const addUser = async (req, res) => {
    try {
        const { userName, email, password } = req.body

        const existingUser = await User.findOne({ where: { email } })

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' })
        }
        bcrypt.hash(password, 10, async (err, hash) => {

            await User.create({
                userName: userName,
                email: email,
                password: hash,
            })
        })
        res.status(201).send('User added')
    } catch (err) {
        res.status(500).send(err)
    }
}

function generateAccessToken(id, name) {
    return jwt.sign({ userId: id, name: name }, 'SECRETKEY')
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // if (password != user.password) {
        //     return res.status(401).send('User not authorized');
        // }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                res.status(500).json({ message: 'Error in password' });
            }
            if (result) {
                const token = generateAccessToken(user.id, user.userName);
                res.status(200).json({
                    message: 'Login successful',
                    token: token
                });

            }
            else {
                res.status(400).json({ message: 'Password is incorrect' });
            }
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = { addUser, loginUser }