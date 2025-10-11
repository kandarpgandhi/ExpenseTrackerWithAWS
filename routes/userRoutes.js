const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')

router.post('/', userController.addUser)
router.post('/login', userController.loginUser);
// router.get('/', userController.getProduct)
// router.put('/:id', userController.updateProduct)

module.exports = router