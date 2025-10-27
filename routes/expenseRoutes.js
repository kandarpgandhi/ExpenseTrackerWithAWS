const express = require('express')
const router = express.Router()
const expenseControler = require('../controller/expenseController')
const userAuthentication = require('../middleware/auth')


router.post('/addexpense', userAuthentication.authenticate, expenseControler.addExpense)
router.delete('/:id', userAuthentication.authenticate, expenseControler.deleteExpense)

////////////////////////////////////
// router.get('/download', userAuthentication.authenticate, expenseControler.downloadExpense)
router.get('/download', userAuthentication.authenticate, expenseControler.downloadExpense);

router.get('/download-history', userAuthentication.authenticate, expenseControler.getDownloadHistory);

router.get('/', userAuthentication.authenticate, expenseControler.getExpense)
/////////////////////////////////////////

module.exports = router
