const express = require("express");
const mongoose = require("mongoose");
const keys = require("./config/keys");

const cookieSession = require('cookie-session');
const passport = require("passport");

mongoose.connect(keys.mongoURI);
require('./models/User');
require('./services/passport');




// this app object here is used to set up configuration that will listen for incoming requests
const app = express(); // express() generates a new applicaiton that represents a running express app

app.use(
	//cookie-session module stores the session data on the client within a cookie

	//Create a new cookie session middleware with the provided options. This middleware
	//will attach the property session to req, which provides an object representing the
	//loaded session. This session is either a new session if no valid session was provided
	//in the request, or a loaded session from the request.

	//The cookie-session middleware will automatically add a Set-Cookie header to the response
    //if the contents of req.session were altered (passport called passport.serializeUser() function).
    //Note that no Set-Cookie header will be in the response (and thus no session created for a
    //specific user) unless there are contents in the session,
    //so be sure to add something to req.session as soon as you have identifying
    //information to store for the session.

	//when user has already logged in and sends more requests, cookie-session module extract cookie data,
	//and then decrypt the data, and the data is past to passport,
	//passport pulls user id out of the cookie data and call passport.deserializeUser function
	//user model instance is added to req object as req.user
	cookieSession({
		maxAge:30*24*8*3600*1000, //how long can this cookie exist in the browser before it expires (in milliseconds)
		keys: [keys.cookieKey] //keys can be chosen to encrypt the cookie

	})
);

//Passport is an authentication middleware for Node that authenticates requests.
//So basically passport.intialize() initialises authentication module.
app.use(passport.initialize());

//passport.session() acts as a middleware to alter the req object and
//change the 'user' value that is currently the session id (from the
//client cookie) into the true deserialized user object.
app.use(passport.session());

require("./routes/authRoutes")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);

