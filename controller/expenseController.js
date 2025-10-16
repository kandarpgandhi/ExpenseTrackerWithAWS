const Expense = require('../models/expense')

///////////added new///////
const User = require('../models/user')
//////////////////////////////////////

const addExpense = async (req, res) => {
    try {
        const { amount, description, category } = req.body

        ////////////////////
        console.log("req.user:", req.user);
        ///////////////////
        const expense = await Expense.create({
            amount: amount,
            description: description,
            category: category,
            userId: req.user.id
        })

        //////////////////added new/////////////

        const user = await User.findByPk(req.user.id)

        if (user) {
            const oldTotal = user.totalExpenseOfUser || 0;
            const newTotal = oldTotal + Number(amount);

            console.log(`Updating totalExpenseOfUser: ${oldTotal} → ${newTotal}`);

            user.totalExpenseOfUser = newTotal;
            await user.save();
        } else {
            console.warn(`⚠️ No user found for id: ${userId}`);
        }
        // console.log(user)
        // user.totalExpenseOfUser = (user.totalExpenseOfUser || 0) + Number(amount)
        // await user.save();
        ///////////////////////////////////////

        res.status(201).send(`Expense added of ${category}`)
    } catch (err) {
        console.error(' Error in adding Expense:', err);
        res.status(500).send(err)
    }
}

const getExpense = async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { userId: req.user.id } })
        res.status(200).json(expenses)
    } catch (err) {
        res.status(500).send(err)
    }
}

const deleteExpense = async (req, res) => {
    try {
        const expenseId = req.params.id
        const userId = req.user.id

        const expense = await Expense.findOne({ where: { id: expenseId, userId: userId } })

        if (!expense) {
            return res.status(403).json({ message: "Not authorized to delete this expense" })
        }

        const user = await User.findByPk(userId);
        if (user) {
            const oldTotal = user.totalExpenseOfUser || 0;
            const newTotal = oldTotal - Number(expense.amount);

            console.log(`Updating totalExpenseOfUser: ${oldTotal} → ${newTotal}`);

            user.totalExpenseOfUser = newTotal;
            if (user.totalExpenseOfUser < 0) user.totalExpenseOfUser = 0;
            await user.save();
            // await user.save();
        } else {
            console.warn(`⚠️ No user found for id: ${userId}`);
        }
        /////////////////////////////

        // const user = await User.findByPk(userId);
        // user.totalExpenseOfUser = (user.totalExpenseOfUser || 0) - Number(expense.amount);
        // if (user.totalExpenseOfUser < 0) user.totalExpenseOfUser = 0;
        // await user.save();
        /////////////////////////////
        await expense.destroy()
        res.status(204).send()
    } catch (err) {
        res.status(500).send(err)
    }
}

module.exports = {
    addExpense, getExpense, deleteExpense
}