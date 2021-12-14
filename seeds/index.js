const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
	useNewUrlParser: true
});

const db = mongoose.connection;
db.once('open', () => {
	console.log('Database connected');
});
db.on('error', console.error.bind(console.log('connection error')));

const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 100; i++) {
		let index = Math.floor(Math.random() * 1000);
		const price = Math.ceil(Math.random() * 30);
		const camp = new Campground({
			location: `${cities[index].city} , ${cities[index].state}`,
			title: `${randomElement(descriptors)} ${randomElement(places)}`,
			author: '61b629c32fda92c23ea61df5',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae provident necessitatibus repudiandae voluptate perspiciatis reiciendis adipisci ab assumenda libero asperiores. Ab explicabo doloremque reprehenderit minima culpa adipisci laborum, repellendus consequuntur.',
			geometry: {
				type: 'Point',
				coordinates: [ cities[index].longitude, cities[index].latitude ]
			},
			images: [
				{
					url:
						'https://res.cloudinary.com/dt4kdj7mp/image/upload/v1639304700/Yelpcamp/g6gonl1xl1dvayr3to81.jpg',
					filename: 'Yelpcamp/g6gonl1xl1dvayr3to81'
				},
				{
					url:
						'https://res.cloudinary.com/dt4kdj7mp/image/upload/v1639304700/Yelpcamp/xkd2of50ea2o7eyg0r9g.jpg',
					filename: 'Yelpcamp/xkd2of50ea2o7eyg0r9g'
				}
			],
			price: price
		});
		await camp.save();
	}
};

seedDb()
	.then(() => {
		console.log('created db');
		mongoose.connection.close();
	})
	.catch((err) => console.log('script failed'));
