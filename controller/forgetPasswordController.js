// const bcrypt = require('bcrypt');
// const User = require('../models/user');
// const Sib = require('sib-api-v3-sdk');
// require('dotenv').config();

// const client = Sib.ApiClient.instance;
// const apiKey = client.authentications['api-key'];
// apiKey.apiKey = process.env.SIB_API_KEY;
// const tranEmailApi = new Sib.TransactionalEmailsApi();

// const sendEmail = async (req, res) => {
//     try {
//         const { email } = req.body;

//         if (!email) {
//             return res.status(400).json({ message: 'Email is required' });
//         }

//         const user = await User.findOne({ where: { email } });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const FRONTEND_URL = 'http://localhost:3000/reset-password.html';
//         const resetLink = `${FRONTEND_URL}?email=${encodeURIComponent(email)}`;

//         const sender = { email: 'kandarpgandhi8@gmail.com', name: 'Expense Tracker Support' };
//         const receivers = [{ email }];

//         await tranEmailApi.sendTransacEmail({
//             sender,
//             to: receivers,
//             subject: 'Reset Your Password - Expense Tracker',
//             htmlContent: `
//                 <h2>Password Reset Request</h2>
//                 <p>Click the link below to reset your password:</p>
//                 <a href="${resetLink}" target="_blank">Reset Password</a>
//                 <p>If you didn’t request this, please ignore this email.</p>
//             `
//         });

//         console.log(`✅ Password reset email sent to ${email}`);
//         res.status(200).json({ message: 'Reset password email sent successfully!' });
//     } catch (err) {
//         console.error('❌ Error sending reset email:', err);
//         res.status(500).json({ message: 'Failed to send reset password email', error: err.message });
//     }
// };

// const resetPassword = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ message: 'Email and new password are required' });
//         }

//         const user = await User.findOne({ where: { email } });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         user.password = hashedPassword;
//         await user.save();

//         console.log(`🔑 Password reset successfully for ${email}`);
//         res.status(200).json({ message: 'Password reset successfully!' });
//     } catch (err) {
//         console.error('❌ Error resetting password:', err);
//         res.status(500).json({ message: 'Failed to reset password', error: err.message });
//     }
// };

// module.exports = { sendEmail, resetPassword };


const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const Sib = require('sib-api-v3-sdk');
const User = require('../models/user');
const ForgotPasswordRequest = require('../models/ForgotPasswordRequest');
require('dotenv').config();

const client = Sib.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();

// 🔹 Step 1: User clicks “Forgot Password”
exports.sendEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // create reset request
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

        console.log(`✅ Reset link generated: ${resetLink}`);
        res.status(200).json({ message: 'Reset link sent successfully!' });

    } catch (err) {
        console.error('❌ Error sending email:', err);
        res.status(500).json({ message: 'Error sending reset email' });
    }
};

// 🔹 Step 2: Serve reset-password.html
exports.getResetPage = async (req, res) => {
    try {
        const requestId = req.params.id;
        const request = await ForgotPasswordRequest.findOne({ where: { id: requestId } });

        if (!request || !request.isActive) {
            return res.status(400).send('<h3>Reset link is invalid or expired.</h3>');
        }

        // serve frontend file
        res.sendFile(require('path').join(__dirname, '../public', 'reset-password.html'));
    } catch (err) {
        console.error('❌ Error loading reset page:', err);
        res.status(500).send('Internal server error.');
    }
};

// 🔹 Step 3: User submits new password
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

        console.log(`🔑 Password reset successfully for ${user.email}`);
        res.status(200).json({ message: 'Password updated successfully!' });

    } catch (err) {
        console.error('❌ Error updating password:', err);
        res.status(500).json({ message: 'Error updating password' });
    }
};
