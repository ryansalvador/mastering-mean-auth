var User = require('mongoose').model('User'),
	passport = require('passport');

//Private method that returns a unified error message from a Mongoose error object.
var getErrorMessage = function(err) {
	var message = '';
	
	//a MongoDB indexing error handled using the error code
	if (err.code) {
	switch (err.code) {
		case 11000:
		case 11001:
			message = 'Username already exists';
		break;
		default:
			message = 'Something went wrong';
	}
	} else {
	//Mongoose validation error handled using the err.errors object
	for (var errName in err.errors) {
		if (err.errors[errName].message) message = err.errors[errName].message;
	}
	}
	
	return message;
};

exports.renderSignin = function(req, res, next) {
	if (!req.user) {
		res.render('signin', {
			title: 'Sign-in Form',
			messages: req.flash('error') || req.flash('info') //Read the messages written to the flash
	});
	} else {
		return res.redirect('/');
	}
};

exports.renderSignup = function(req, res, next) {
  if (!req.user) {
		res.render('signup', {
		title: 'Sign-up Form',
		messages: req.flash('error') //Read the messages written to the flash
	});
  } else {
    	return res.redirect('/');
  }
};

//Uses User model to create new users
exports.signup = function(req, res, next) {
	if (!req.user) {
		//It first creates a user object from the HTTP request body. Then, try saving it to MongoDB.
		var user = new User(req.body);
		var message = null;
		
		user.provider = 'local';
		
		user.save(function(err) {
			if (err) {
				var message = getErrorMessage(err);
			
				req.flash('error', message); //Error messages are written to the flash (note: same as reading in Flash)
				return res.redirect('/signup');
			}
			
			req.login(user, function(err) {
				if (err) return next(err);
				return res.redirect('/');
			});
		});
	} else {
		return res.redirect('/');
	}
};

//Uses the req.logout() method, which is provided by the Passport module to invalidate the authenticated session
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};