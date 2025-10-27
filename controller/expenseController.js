const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../utils/db-connection');

//////////////////////////////////////
const Download = require('../models/Download');
//////////////////////////////////////////////////////////
const AWS = require('aws-sdk')
require('dotenv').config();

const getDownloadHistory = async (req, res) => {
    try {
        const history = await Download.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(history);
    } catch (err) {
        console.error('Error fetching download history:', err);
        res.status(500).json({ message: 'Failed to fetch download history' });
    }
};

function uploadToS3(data, filename) {
    // const BUCKET_NAME = 'expensetrackingappforkandarp'
    // const IAM_USER_KEY = 'AKIAX3DCXXQIQRK3GVFL'
    // const IAM_USER_SECRET = '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'
    const BUCKET_NAME = process.env.BUCKET_NAME
    const IAM_USER_KEY = process.env.IAM_USER_KEY
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET

    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    })


    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    }
    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if (err) {
                console.log("Something went wrong", err)
                reject(err)
            }
            else {
                console.log('Success', s3response)
                resolve(s3response.Location)
            }
        })
    })


}

const downloadExpense = async (req, res) => {
    try {
        // alert("testing")
        const expenses = await req.user.getExpenseTables()
        console.log(expenses)
        const stringifiedExpenses = JSON.stringify(expenses)
        const userId = req.user.id
        const filename = `Expense${userId}/${new Date()}.txt`

        const fileURL = await uploadToS3(stringifiedExpenses, filename)
        await Download.create({
            fileURL,
            userId: req.user.id
        });
        res.status(200).json({ fileURL, success: true })
    } catch (err) {
        console.log(err)
        res.status(500).json({ fileURL: '', success: false })
    }
}

/////////////////////////////////////////////////////

const addExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount, description, category, note } = req.body;
        console.log("req.user:", req.user);


        await Expense.create({
            amount,
            description,
            category,
            userId: req.user.id,
            note
        }, { transaction: t });


        const user = await User.findByPk(req.user.id, { transaction: t });
        if (!user) {
            await t.rollback();
            console.warn(` No user found for id: ${req.user.id}`);
            return res.status(404).json({ message: "User not found" });
        }

        const oldTotal = user.totalExpenseOfUser || 0;
        const newTotal = oldTotal + Number(amount);
        console.log(`Updating totalExpenseOfUser: ${oldTotal} → ${newTotal}`);

        user.totalExpenseOfUser = newTotal;
        await user.save({ transaction: t });


        await t.commit();

        res.status(201).send(`Expense added of ${category}`);
    } catch (err) {
        console.error(' Error in adding Expense:', err);
        if (t) await t.rollback();
        res.status(500).send(err);
    }
};


const getExpense = async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { userId: req.user.id } });
        res.status(200).json(expenses);
    } catch (err) {
        res.status(500).send(err);
    }
};


const deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const expenseId = req.params.id;
        const userId = req.user.id;


        const expense = await Expense.findOne({
            where: { id: expenseId, userId },
            transaction: t
        });

        if (!expense) {
            await t.rollback();
            return res.status(403).json({ message: "Not authorized to delete this expense" });
        }


        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            console.warn(` No user found for id: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        const oldTotal = user.totalExpenseOfUser || 0;
        const newTotal = Math.max(0, oldTotal - Number(expense.amount));
        console.log(`Updating totalExpenseOfUser: ${oldTotal} → ${newTotal}`);

        user.totalExpenseOfUser = newTotal;
        await user.save({ transaction: t });


        await expense.destroy({ transaction: t });


        await t.commit();

        res.status(204).send();
    } catch (err) {
        console.error(" Error in deleting Expense:", err);
        if (t) await t.rollback();
        res.status(500).send(err);
    }
};

module.exports = { addExpense, getExpense, deleteExpense, downloadExpense, getDownloadHistory };
