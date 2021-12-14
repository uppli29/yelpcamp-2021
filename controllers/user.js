const User = require('../models/user');
module.exports.registerUser = async (req, res) => {
	try {
		const { username, email, password } = req.body;
		const user = new User({ email, username });
		const newUser = await User.register(user, password);
		console.log(newUser);
		req.login(newUser, (err) => {
			if (err) return next(err);
			req.flash('success', 'Welcome to Yelp Camp!');
			res.redirect('/campgrounds');
		});
	} catch (e) {
		req.flash('error', e.message);
		res.redirect('register');
	}
};

module.exports.login = (req, res) => {
	req.flash('success', 'Welcome Back!');
	const returnTo = req.session.returnTo || '/camgrounds';
	delete req.session.returnTo;
	res.redirect(returnTo);
};
module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'Logged Out!');
	res.redirect('/campgrounds');
};
