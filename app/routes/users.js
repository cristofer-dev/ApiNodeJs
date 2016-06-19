var express = require('express');
var router = express.Router();
var app = express();
var jwt = require('jsonwebtoken');

var validateToken = require('../middlewares/tokenvalidate');
var secretKey = require('../../config').secret;

var User = require('../models/user');


// route to show a random message (GET http://localhost:8080/api/)
router.get('/', function(req, res) {
    res.json({
        message: 'Bienvenido a la API de IV Devs... La Comunidad mas Cool!'
    });
});

// route to return all users (GET http://localhost:8080/api/users)
router.get('/user', validateToken, function(req, res) {
    var user = req.decoded._doc;
    var filters = {};

    if (!user.admin) {
        filters._id = user._id;
    }
    console.log(filters);
    User.find(filters, function(err, users) {
        res.json(users);
    });
});

// route to login a user (POST http://localhost:8080/api/user/login)
router.post('/user/login', function(req, res) {

    // find the user
    User.findOne({
        username: req.body.username
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
                    var token = jwt.sign(user, secretKey, {
                        expiresIn: "1h"
                    });

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

// route to register a user (POST http://localhost:8080/api/user/signup)
router.post('/user/signup', function(req, res) {

    var new_user = new User(req.body);
    new_user.save(function(err, data) {
        if (err) {
            var msg = '';
            if (err.hasOwnProperty('errmsg'))
                msg = err.errmsg;
            else if (err.hasOwnProperty('errors'))
                msg = err.errors;
            else msg = err.message;

            console.error(err);
            res.status(500).json({
                message: msg
            }).end();
        } else {
            //TODO: enviar mail para confirmar correo 
            console.log('User saved successfully');
            console.log(data);
            data.success = true;
            res.status(200).json(data).end();

        }
    });
});

router.put('/user/', validateToken, function(req, res) {
    //TODO: editar usuario
});

router.get('user/activation/:token', function(req, res) {
    //TODO: activar cuenta con token
});

router.post('/user/recovery/', function(req, res) {
    //TODO: recuperación de contraseña
});

// route to view a user data by token (POST http://localhost:8080/api/user/me)
router.put('/user/me', validateToken, function(req, res) {
    var user = req.decoded._doc;

    var filters = {
        _id: user._id
    };

    User.find(filters, function(err, users) {
        res.json(users);
    });
});

module.exports = router;