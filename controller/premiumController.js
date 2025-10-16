const axios = require('axios');
const User = require('../models/user');
const Expense = require('../models/expense');
const sequelize = require('../utils/db-connection');
const jwt = require('jsonwebtoken');

const CASHFREE_APP_ID = "TEST430329ae80e0f32e41a393d78b923034";
const CASHFREE_SECRET_KEY = "TESTaf195616268bd6202eeb3bf8dc458956e7192a85";
const CASHFREE_URL = "https://sandbox.cashfree.com/pg/orders";

exports.createOrder = async (req, res) => {
    try {
        const { userName, email } = req.user;
        const orderId = 'order_' + Date.now();

        const response = await axios.post(CASHFREE_URL, {
            order_id: orderId,
            order_amount: 499,
            order_currency: "INR",
            customer_details: {
                customer_id: String(req.user.id),
                customer_name: userName,
                customer_email: email,
                customer_phone: "9999999999",
            },
            order_meta: {
                return_url: "http://localhost:3000/payment-success.html?order_id={order_id}"
            }
        }, {
            headers: {
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": "2022-09-01",
                "Content-Type": "application/json"
            }
        });

        res.json({ order: response.data, orderId: orderId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating order' });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (status === 'PAID') {
            req.user.isPremium = true;
            await req.user.save();

            // const newToken = jwt.sign(
            //     { userId: req.user.id, userName: req.user.userName, isPremium: req.user.isPremium },
            //     process.env.JWT_SECRET
            // );

            return res.status(200).json({ success: true, message: "Payment successful! User upgraded to premium." });
        }
        res.status(400).json({ success: false, message: "Payment not successful" });
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment status' });
    }
};

exports.getLeaderBoard = async (req, res) => {
    try {
        if (!req.user.isPremium) {
            return res.status(403).json({ message: "Access denied. Not a premium user." });
        }

        // const leaderboardofusers = await Expense.findAll({
        //     attributes: [
        //         'userId',
        //         [sequelize.fn('sum', sequelize.col('amount')), 'totalExpense']
        //     ],
        //     include: [
        //         {
        //             model: User,
        //             attributes: ['id', 'userName']
        //         }
        //     ],
        //     group: ['userId', 'userforexpenseapp.id'],
        //     order: [[sequelize.fn('sum', sequelize.col('amount')), 'DESC']]
        // });

        const leaderboardofusers = await User.findAll({
            attributes: [
                'id', 'userName',
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('amount')), 0), 'totalExpense']
            ],
            include: [
                {
                    model: Expense,
                    attributes: [],
                    required: false
                }
            ],
            group: ['userforexpenseapp.id'],
            order: [[sequelize.literal('totalExpense'), 'DESC']]
        });



        res.status(200).json(leaderboardofusers);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};

exports.checkPremiumStatus = async (req, res) => {
    try {
        res.status(200).json({ isPremium: req.user.isPremium });
    } catch (err) {
        res.status(500).json({ message: "Error checking premium status" });
    }
};
