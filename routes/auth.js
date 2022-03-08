const express = require('express');
const {register, login, getMe, forgotPassword, updateDetails, resetPassword, updatePassword} = require('../controllers/auth');

const router = express.Router();

const {protect} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.route('/updatedetails').put(protect, updateDetails);
router.route('/updatepassword').put(protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);

module.exports = router;