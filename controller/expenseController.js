const Expense = require('../models/expense')

const addExpense = async (req, res) => {
    try {
        const { amount, description, category } = req.body
        const expense = await Expense.create({
            amount: amount,
            description: description,
            category: category
        })
        res.status(201).send(`Expense added of ${category}`)
    } catch (err) {
        console.error(' Error in adding Expense:', err);
        res.status(500).send(err)
    }
}

const getExpense = async (req, res) => {
    try {
        const expenses = await Expense.findAll()
        res.status(200).json(expenses)
    } catch (err) {
        res.status(500).send(err)
    }
}

const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.destroy({ where: { id: req.params.id } })
        res.status(204).send()
    } catch (err) {
        res.status(500).send(err)
    }
}

module.exports = {
    addExpense, getExpense, deleteExpense
}