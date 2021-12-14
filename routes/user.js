const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const user = require('../controllers/user');

router
	.route('/register')
	.get((req, res) => {
		res.render('Users/Register');
	})
	.post(catchAsync(user.registerUser));

router
	.route('/login')
	.get((req, res) => {
		res.render('Users/Login');
	})
	.post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.login);

router.get('/logout', user.logout);

module.exports = router;
