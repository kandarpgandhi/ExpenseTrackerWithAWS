const express = require('express')
const router = express.Router()
const forgetPasswordController = require('../controller/forgetPasswordController')

// router.post('/', userController.addUser)
router.post('/forgot-password', forgetPasswordController.sendEmail);

router.post('/reset-password', forgetPasswordController.resetPassword);

// router.get('/', userController.getProduct)
// router.put('/:id', userController.updateProduct)

module.exports = router