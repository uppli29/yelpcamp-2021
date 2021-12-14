const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const { campgroundSchema, reviewSchema } = require('../schemas');

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.flash('error', 'You must be SignedIn!');
		res.redirect('/login');
	}
	next();
};

module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	}
	next();
};

module.exports.isAuthor = async (req, res, next) => {
	const campGround = await Campground.findById(req.params.id);
	if (!campGround.author.equals(req.user._id)) {
		req.flash('error', 'You dont have permission to do that');
		return res.redirect(`/campgrounds/${req.params.id}`);
	}
	next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to do that!');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};
