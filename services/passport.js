const keys=require("../config/keys");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const mongoose = require("mongoose");
const User = mongoose.model('users');

//passport.serializeUser function is automatically called by passport
//done is callback
passport.serializeUser((user, done)=>{

    //The user id (you provide as the second argument of the done function)
    //is saved in the session and is later used to retrieve the whole object
    //via the deserializeUser function.

    //serializeUser determines, which data of the user object should be stored
    //in the session. The result of the serializeUser method is attached to the
    //session as req.session.passport.user = {}. Here for instance, it would be
    //(as we provide the user id as the key) req.session.passport.user = {id:'xyz'}

    //The cookie-session middleware will automatically add a Set-Cookie header to the response
    //if the contents of req.session were altered. Note that no Set-Cookie header will be in
    //the response (and thus no session created for a specific user) unless there are contents
    //in the session, so be sure to add something to req.session as soon as you have identifying
    //information to store for the session.

	done(null, user.id); //passport inset user.id into the cookie for us

});

//id is user.id
//we try to retrieve the user by using its id

passport.deserializeUser((id, done)=>{
	User.findById(id)
		.then(user=>{
			done(null, user); //user object attaches to the request as req.user
		})
});

passport.use(
	new GoogleStrategy({
		clientID:keys.googleClientID,
		clientSecret:keys.googleClientSecret,
		callbackURL: "/auth/google/callback"
	}, (accessToken, refreshToken, profile, done)=>{
		console.log("done", done);
		User.findOne({googleID:profile.id})
			.then(existingUser=>{
				if (existingUser){
					console.log("we have already had a record with the giving profile ID");
					done(null, existingUser); //passport.serializeUser function is automatically called by passport afterwards
				}
				else {
					console.log("we do not have an existing user with the same profile ID");
					new User({googleID:profile.id})
					.save()
					.then(user=>done(null, user)); //passport.serializeUser function is automatically called by passport afterwards
				}
			})

	})
);
