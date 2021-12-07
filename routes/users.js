const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");

router.route('/').get(authController().index);
router.route('/logout').get(authController().logout);
router.route('/register').get(authController().register);
router.route('/register').post(authController().registerPost);
//router.route('/login').get(authController().login);
router.route('/login').post(authController().postLogin);

module.exports = router;