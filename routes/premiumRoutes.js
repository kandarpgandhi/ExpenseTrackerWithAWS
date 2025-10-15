const express = require('express');
const router = express.Router();
const premiumController = require('../controller/premiumController');
const userAuthentication = require('../middleware/auth');

router.post('/buy', userAuthentication.authenticate, premiumController.createOrder);
router.post('/status', userAuthentication.authenticate, premiumController.updatePaymentStatus);
router.get('/leaderboard', userAuthentication.authenticate, premiumController.getLeaderBoard);
router.get('/check-status', userAuthentication.authenticate, premiumController.checkPremiumStatus);


module.exports = router;
