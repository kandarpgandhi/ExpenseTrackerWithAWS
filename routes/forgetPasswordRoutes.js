// const express = require('express')
// const router = express.Router()
// const forgetPasswordController = require('../controller/forgetPasswordController')

// router.post('/forgot-password', forgetPasswordController.sendEmail);

// router.post('/reset-password', forgetPasswordController.resetPassword);

// module.exports = router

const express = require('express');
const router = express.Router();
const forgetPasswordController = require('../controller/forgetPasswordController');

// Step 1: request reset
router.post('/forgot-password', forgetPasswordController.sendEmail);

// Step 2: open reset page from email link
router.get('/resetpassword/:id', forgetPasswordController.getResetPage);

// Step 3: update new password
router.post('/updatepassword/:id', forgetPasswordController.updatePassword);

module.exports = router;
