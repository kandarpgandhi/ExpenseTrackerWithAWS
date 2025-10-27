const express = require('express');
const router = express.Router();
const forgetPasswordController = require('../controller/forgetPasswordController');

router.post('/forgot-password', forgetPasswordController.sendEmail);

router.get('/resetpassword/:id', forgetPasswordController.getResetPage);

router.post('/updatepassword/:id', forgetPasswordController.updatePassword);

module.exports = router;
