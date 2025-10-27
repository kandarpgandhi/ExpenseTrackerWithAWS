const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const Sib = require('sib-api-v3-sdk');
const User = require('../models/user');
const ForgotPasswordRequest = require('../models/ForgotPasswordRequest');
require('dotenv').config();

const client = Sib.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();


exports.sendEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });


        const id = uuidv4();
        await ForgotPasswordRequest.create({ id, userId: user.id, isActive: true });

        const resetLink = `http://localhost:3000/password/resetpassword/${id}`;

        const sender = { email: 'kandarpgandhi8@gmail.com', name: 'Expense Tracker Support' };

        await tranEmailApi.sendTransacEmail({
            sender,
            to: [{ email }],
            subject: 'Reset Your Password - Expense Tracker',
            htmlContent: `
        <h3>Forgot Password</h3>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <br/><br/>
        <p>If you didn’t request this, please ignore this email.</p>
      `
        });

        console.log(` Reset link generated: ${resetLink}`);
        res.status(200).json({ message: 'Reset link sent successfully!' });

    } catch (err) {
        console.error(' Error sending email:', err);
        res.status(500).json({ message: 'Error sending reset email' });
    }
};

exports.getResetPage = async (req, res) => {
    try {
        const requestId = req.params.id;
        const request = await ForgotPasswordRequest.findOne({ where: { id: requestId } });

        if (!request || !request.isActive) {
            return res.status(400).send('<h3>Reset link is invalid or expired.</h3>');
        }


        res.sendFile(require('path').join(__dirname, '../public', 'reset-password.html'));
    } catch (err) {
        console.error(' Error loading reset page:', err);
        res.status(500).send('Internal server error.');
    }
};


exports.updatePassword = async (req, res) => {
    try {
        const { password } = req.body;
        const requestId = req.params.id;

        if (!password) return res.status(400).json({ message: 'Password required' });

        const request = await ForgotPasswordRequest.findOne({ where: { id: requestId } });
        if (!request || !request.isActive) {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        const user = await User.findByPk(request.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        request.isActive = false;
        await request.save();

        console.log(` Password reset successfully for ${user.email}`);
        res.status(200).json({ message: 'Password updated successfully!' });

    } catch (err) {
        console.error(' Error updating password:', err);
        res.status(500).json({ message: 'Error updating password' });
    }
};
