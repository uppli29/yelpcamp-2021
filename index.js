if (process.env.NODE_ENV != 'production') require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsEngine = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');

const User = require('./models/user');
const ExpressError = require('./utils/ExpressError');
const campgroundRoute = require('./routes/campground');
const reviewRoute = require('./routes/reviews');
const userRoute = require('./routes/user');

console.log(process.env.api_secret);

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
	useNewUrlParser: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console.log('connection error')));
db.once('open', () => {
	console.log('Database connected');
});

const sessionConfig = {
	name: 'session',
	secret: 'thisisasecret!',
	store: new MongoDBStore({
		mongoUrl: process.env.DB_URL,
		secret: 'thisisasecret!',
		touchAfter: 24 * 60 * 60
	}),
	resave: false,
	saveUninitalized: true,
	cookie: {
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
		httpOnly: true
	}
};

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.engine('ejs', ejsEngine);
app.use(express.static('public'));
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(helmet({ contentSecurityPolicy: false }));
app.locals.moment = require('moment');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	if (![ '/login', '/' ].includes(req.originalUrl)) {
		req.session.returnTo = req.originalUrl;
	}
	res.locals.currentUser = req.user;
	console.log(req.user);
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/reviews', reviewRoute);
app.use('/', userRoute);

app.get('/', (req, res) => {
	res.render('Home');
});

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh No, Something Went Wrong!';
	res.status(statusCode).render('error', { err });
});

app.listen(8000, () => {
	console.log('Started on 8000');
});
