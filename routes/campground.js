const express = require('express');
const route = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middlewares/middleware');
const campground = require('../controllers/campground');
const multer = require('multer');
const { storage } = require('../cloudinary/config');
const upload = multer({ storage });

route
	.route('/')
	.get(catchAsync(campground.index))
	.post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campground.createCampground));

route.get('/new', isLoggedIn, campground.renderNewForm);

route.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.editCampground));

route
	.route('/:id')
	.get(catchAsync(campground.getCampground))
	.put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campground.updateCampground))
	.delete(isAuthor, isLoggedIn, catchAsync(campground.deleteCampground));

module.exports = route;
