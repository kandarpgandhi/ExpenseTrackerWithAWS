// const Expense = require('../models/expense')
// const User = require('../models/user')
// const sequelize = require('../utils/db-connection')

// const addExpense = async (req, res) => {
//     const t = await sequelize.transaction()
//     try {
//         const { amount, description, category } = req.body
//         console.log("req.user:", req.user);
//         const expense = await Expense.create({
//             amount: amount,
//             description: description,
//             category: category,
//             userId: req.user.id
//         }, { transaction: t })

//         const user = await User.findByPk(req.user.id, { transaction: t })

//         if (user) {
//             const oldTotal = user.totalExpenseOfUser || 0;
//             const newTotal = oldTotal + Number(amount);

//             console.log(`Updating totalExpenseOfUser: ${oldTotal} → ${newTotal}`);

//             user.totalExpenseOfUser = newTotal;
//             await user.save({ transaction: t });
//             await t.commit()
//         } else {
//             await t.rollback()
//             console.warn(`⚠️ No user found for id: ${userId}`);
//         }

//         res.status(201).send(`Expense added of ${category}`)
//     } catch (err) {
//         await t.rollback()
//         console.error(' Error in adding Expense:', err);
//         res.status(500).send(err)
//     }
// }

// const getExpense = async (req, res) => {
//     try {
//         const expenses = await Expense.findAll({ where: { userId: req.user.id } })
//         res.status(200).json(expenses)
//     } catch (err) {
//         res.status(500).send(err)
//     }
// }

// const deleteExpense = async (req, res) => {
//     const t = await sequelize.transaction()
//     try {
//         const expenseId = req.params.id
//         const userId = req.user.id

//         const expense = await Expense.findOne({ where: { id: expenseId, userId: userId } }, { transaction: t })

//         if (!expense) {
//             await t.rollback()
//             return res.status(403).json({ message: "Not authorized to delete this expense" })
//         }

//         const user = await User.findByPk(userId, { transaction: t });
//         if (user) {
//             const oldTotal = user.totalExpenseOfUser || 0;
//             const newTotal = oldTotal - Number(expense.amount);

//             console.log(`Updating totalExpenseOfUser: ${oldTotal} → ${newTotal}`);

//             user.totalExpenseOfUser = newTotal;
//             if (user.totalExpenseOfUser < 0) user.totalExpenseOfUser = 0;
//             await user.save({ transaction: t });
//             await t.commit()
//         } else {
//             await t.rollback()
//             console.warn(`⚠️ No user found for id: ${userId}`);
//         }
//         await expense.destroy({ transaction: t })
//         await t.commit()
//         res.status(204).send()
//     } catch (err) {
//         await t.rollback()
//         res.status(500).send(err)
//     }
// }

// module.exports = {
//     addExpense, getExpense, deleteExpense
// }

const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../utils/db-connection');

const addExpense = async (req, res) => {
    const t = await sequelize.transaction(); // define before try
    try {
        const { amount, description, category } = req.body;
        console.log("req.user:", req.user);

        // 1️⃣ Create expense
        await Expense.create({
            amount,
            description,
            category,
            userId: req.user.id
        }, { transaction: t });

        // 2️⃣ Update user's total
        const user = await User.findByPk(req.user.id, { transaction: t });
        if (!user) {
            await t.rollback();
            console.warn(`⚠️ No user found for id: ${req.user.id}`);
            return res.status(404).json({ message: "User not found" });
        }

        const oldTotal = user.totalExpenseOfUser || 0;
        const newTotal = oldTotal + Number(amount);
        console.log(`Updating totalExpenseOfUser: ${oldTotal} → ${newTotal}`);

        user.totalExpenseOfUser = newTotal;
        await user.save({ transaction: t });

        // 3️⃣ Commit once everything succeeded
        await t.commit();

        res.status(201).send(`Expense added of ${category}`);
    } catch (err) {
        console.error('❌ Error in adding Expense:', err);
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

        // 1️⃣ Find expense inside transaction
        const expense = await Expense.findOne({
            where: { id: expenseId, userId },
            transaction: t
        });

        if (!expense) {
            await t.rollback();
            return res.status(403).json({ message: "Not authorized to delete this expense" });
        }

        // 2️⃣ Find and update user total
        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            console.warn(`⚠️ No user found for id: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        const oldTotal = user.totalExpenseOfUser || 0;
        const newTotal = Math.max(0, oldTotal - Number(expense.amount));
        console.log(`Updating totalExpenseOfUser: ${oldTotal} → ${newTotal}`);

        user.totalExpenseOfUser = newTotal;
        await user.save({ transaction: t });

        // 3️⃣ Delete the expense
        await expense.destroy({ transaction: t });

        // 4️⃣ Commit once at the end
        await t.commit();

        res.status(204).send();
    } catch (err) {
        console.error("❌ Error in deleting Expense:", err);
        if (t) await t.rollback();
        res.status(500).send(err);
    }
};

module.exports = { addExpense, getExpense, deleteExpense };
