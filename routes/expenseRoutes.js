const express = require('express')
const router = express.Router()
const expenseControler = require('../controller/expenseController')

router.post('/addexpense', expenseControler.addExpense)
router.get('/', expenseControler.getExpense)
router.delete('/:id', expenseControler.deleteExpense)

module.exports = router
