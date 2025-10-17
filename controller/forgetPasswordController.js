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

//         // You can later check if this email exists in your DB if you want
//         // const user = await User.findOne({ where: { email } });
//         // if (!user) return res.status(404).json({ message: 'User not found' });

//         const sender = {
//             email: 'kandarpgandhi8@gmail.com',
//             name: 'Expense Tracker Support'
//         };

//         const receivers = [{ email }];

//         const response = await tranEmailApi.sendTransacEmail({
//             sender,
//             to: receivers,
//             subject: 'Reset your password - Expense Tracker',
//             textContent: `
//         Hi,
//         You requested to reset your password.
//         Click the link below to reset your password:
//         https://yourfrontendurl.com/reset-password?email=${encodeURIComponent(email)}

//         If you didn’t request this, please ignore this email.
//       `,
//             htmlContent: `
//         <h3>Forgot Password</h3>
//         <p>Click below to reset your password:</p>
//         <a href="https://yourfrontendurl.com/reset-password?email=${encodeURIComponent(email)}" target="_blank">
//           Reset Password
//         </a>
//         <br/><br/>
//         <p>If you didn’t request this, please ignore this email.</p>
//       `
//         });

//         console.log('✅ Email sent:', response);
//         res.status(200).json({ message: 'Reset password email sent successfully' });
//     } catch (error) {
//         console.error('❌ Error sending email:', error);
//         res.status(500).json({ message: 'Error sending email', error: error.message });
//     }
// };

// module.exports = { sendEmail };

// const bcrypt = require('bcrypt');
// const User = require('../models/user')
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

//         // Later, you can add:
//         // const user = await User.findOne({ where: { email } });
//         // if (!user) return res.status(404).json({ message: 'User not found' });

//         // 🔹 Use environment variable or fallback to local host for testing
//         const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
//         const resetLink = `${FRONTEND_URL}/reset-password.html?email=${encodeURIComponent(email)}`;

//         const sender = {
//             email: 'kandarpgandhi8@gmail.com',
//             name: 'Expense Tracker Support'
//         };

//         const receivers = [{ email }];

//         // 🔹 Send email using Sendinblue
//         const response = await tranEmailApi.sendTransacEmail({
//             sender,
//             to: receivers,
//             subject: 'Reset your password - Expense Tracker',
//             textContent: `
// Hi,

// You requested to reset your password.
// Click the link below to reset your password:
// ${resetLink}

// If you didn’t request this, please ignore this email.
//       `,
//             htmlContent: `
// <h3>Forgot Password</h3>
// <p>Click below to reset your password:</p>
// <a href="${resetLink}" target="_blank" 
//   style="background-color:#007bff;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">
//   Reset Password
// </a>
// <br/><br/>
// <p>If you didn’t request this, please ignore this email.</p>
//       `
//         });

//         console.log('✅ Email sent successfully:', response);
//         res.status(200).json({ message: 'Reset password email sent successfully' });

//     } catch (error) {
//         console.error('❌ Error sending email:', error);
//         res.status(500).json({ message: 'Error sending email', error: error.message });
//     }
// };

// const resetPassword = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password)
//             return res.status(400).json({ message: 'Email and password are required' });

//         const user = await User.findOne({ where: { email } });
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         const hashedPassword = await bcrypt.hash(password, 10);
//         user.password = hashedPassword;
//         await user.save();

//         res.json({ message: 'Password reset successfully!' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

// module.exports = { sendEmail, resetPassword };

const bcrypt = require('bcrypt');
const User = require('../models/user');
const Sib = require('sib-api-v3-sdk');
require('dotenv').config();

// ✅ Initialize SendinBlue
const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();

/**
 * STEP 1️⃣ — Send Reset Password Email
 */
const sendEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Optional: Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 🔹 Generate frontend reset URL (you can adjust base path)
        const FRONTEND_URL = 'http://localhost:3000/reset-password.html';
        const resetLink = `${FRONTEND_URL}?email=${encodeURIComponent(email)}`;

        // 🔹 Email Details
        const sender = { email: 'kandarpgandhi8@gmail.com', name: 'Expense Tracker Support' };
        const receivers = [{ email }];

        // 🔹 Send Transactional Email
        await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Reset Your Password - Expense Tracker',
            htmlContent: `
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}" target="_blank">Reset Password</a>
                <p>If you didn’t request this, please ignore this email.</p>
            `
        });

        console.log(`✅ Password reset email sent to ${email}`);
        res.status(200).json({ message: 'Reset password email sent successfully!' });
    } catch (err) {
        console.error('❌ Error sending reset email:', err);
        res.status(500).json({ message: 'Failed to send reset password email', error: err.message });
    }
};

/**
 * STEP 2️⃣ — Handle Password Reset
 */
const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 🔹 Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        console.log(`🔑 Password reset successfully for ${email}`);
        res.status(200).json({ message: 'Password reset successfully!' });
    } catch (err) {
        console.error('❌ Error resetting password:', err);
        res.status(500).json({ message: 'Failed to reset password', error: err.message });
    }
};

module.exports = { sendEmail, resetPassword };
