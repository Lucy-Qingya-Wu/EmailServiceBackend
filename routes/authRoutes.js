const passport = require("passport");
module.exports = (app) => {
	app.get(
		"/auth/google",
		passport.authenticate('google', {
			scope: ['profile', 'email'],
		})
	);

	app.get(
		"/auth/google/callback",
		passport.authenticate('google')
	);

	app.get("/api/current_user", (req, res)=>{
		res.send(req.user);
	});

	app.get("/api/logout", (req, res)=>{
		req.logout(); //req.user is destroyed by passport, this user is no longer logged in
		//in the response, set-cookie will ask client to set cookie-based session to null
		res.send(req.user);
	});
}
