const express = require("express");
const router = express.Router();
const controller = require('../controllers/userController');
const validateToken = require('../middleware/validateUser').validateToken;
const logoutToken = require('../middleware/logoutUser').logoutToken;

router.post('/sign_otp', controller.sign_otp)

router.post('/create', controller.create)
router.post('/signup_verify_login', controller.signup_verify_login)
router.post('/send_login_otp', controller.send_login_otp)
router.post('/login', controller.login)
router.post('/check_phone_no_exists', controller.check_phone_no_exists)
router.post('/user_details', controller.user_details)
router.post('/create_member', controller.create_member)

router.post('/get_member_by_id', controller.get_member_by_id)
router.post('/add_subscription', controller.add_subscription)
router.post('/get_member_detais', controller.get_member_detais)














module.exports = router;
