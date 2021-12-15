const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary/config');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const Fuse = require('fuse.js');

const geoCoder = mbxGeocoding({ accessToken: process.env.MAP_BOX_TOKEN });

module.exports.index = async (req, res) => {
	let campGrounds = await Campground.find({});
	if (req.query.search) {
		const fuse = new Fuse(campGrounds, {
			shouldSort: true,
			keys: [ 'title' ]
		});
		campGrounds = fuse.search(req.query.search);
		let result = [];
		campGrounds.forEach((campground) => {
			result.push(campground.item);
		});
		res.render('Campgrounds/Home', { campgrounds: result });
	} else {
		res.render('Campgrounds/Home', { campgrounds: campGrounds });
	}
};

module.exports.getCampground = async (req, res, next) => {
	const campGround = await Campground.findById(req.params.id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author'
			}
		})
		.populate('author');

	res.render('Campgrounds/Show', { campGround });
};

module.exports.renderNewForm = async (req, res) => {
	res.render('Campgrounds/New');
};

module.exports.editCampground = async (req, res, next) => {
	const id = req.params.id;
	const campGround = await Campground.findById(id);
	if (!campGround) {
		res.flash('error', 'Cannot find that campground');
		return res.redirect('/campgrounds');
	}

	res.render('Campgrounds/Edit', { campGround });
};

module.exports.createCampground = async (req, res) => {
	const campGround = new Campground(req.body.campground);
	campGround.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	const geoData = await geoCoder
		.forwardGeocode({
			query: req.body.campground.location,
			limit: 1
		})
		.send();

	campGround.author = req.user._id;
	campGround.geometry = geoData.body.features[0].geometry;
	await campGround.save();

	req.flash('success', 'Successfully create a campground');
	res.redirect(`/campgrounds/${campGround._id}`);
};

module.exports.updateCampground = async (req, res) => {
	const campGround = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
	const images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	campGround.images.push(...images);
	await campGround.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campGround.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
	}
	req.flash('success', 'Successfully updated Campground');
	res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteCampground = async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id);
	req.flash('error', 'Successfully deleted Campground');

	res.redirect('/campgrounds');
};
