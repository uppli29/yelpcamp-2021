const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const opts = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
	url: String,
	filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
	return this.url.replace('/upload', '/upload/w_200');
});

const campgroundSchema = new Schema(
	{
		title: String,
		price: Number,
		images: [ ImageSchema ],
		created: { type: Date, default: Date.now },
		geometry: {
			type: {
				type: String, // Don't do `{ location: { type: String } }`
				enum: [ 'Point' ], // 'location.type' must be 'Point'
				required: true
			},
			coordinates: {
				type: [ Number ],
				required: true
			}
		},
		description: String,
		location: String,
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Review'
			}
		]
	},
	opts
);

campgroundSchema.virtual('properties.popUpMarkup').get(function() {
	return `<a href=/campgrounds/${this._id}>${this.title}</a>`;
});

campgroundSchema.post('findOneAndDelete', async function(doc) {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews
			}
		});
	}
});

module.exports = mongoose.model('Campground', campgroundSchema);
