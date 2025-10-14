const express = require('express')
const router = express.Router()
const expenseControler = require('../controller/expenseController')
const userAuthentication = require('../middleware/auth')

router.post('/addexpense', userAuthentication.authenticate, expenseControler.addExpense)
router.get('/', userAuthentication.authenticate, expenseControler.getExpense)
router.delete('/:id', userAuthentication.authenticate, expenseControler.deleteExpense)

module.exports = router
