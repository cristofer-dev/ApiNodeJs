var express = require('express');
var router = express.Router();
var app = express();

var validateToken = require('../middlewares/tokenvalidate');
var secretKey = require('../../config').secret;

var User = require('../models/user'); // get our mongoose model


// route to show a random message (GET http://localhost:8080/api/)
router.get('/', function(req, res) {
    res.json({
        message: 'Bienvenido a la API de IV Devs... La Comunidad mas Cool!'
    });
});

// route to return all users (GET http://localhost:8080/api/users)
router.get('/user', validateToken, function(req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    });
});

// route to login a user (POST http://localhost:8080/api/login)
router.post('/user/login', function(req, res) {

    // find the user
    User.findOne({
        username: req.body.name
    }, function(err, user) {

        if (err) throw err;

        if (!user) {
            res.json({
                success: false,
                message: 'Authentication failed. User not found.'
            });
        } else if (user) {

            // check if password matches
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (err) throw err;

                if (!isMatch) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                } else {

                    // if user is found and password is right
                    // create a token        
                    var token = jwt.sign(user, secretKey);

                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }
            });
        }

    });
});

module.exports = router;