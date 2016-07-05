var express = require('express');
var router = express.Router();
var app = express();
var jwt = require('jsonwebtoken');
var rand = require("generate-key");

var validateToken = require('../middlewares/tokenvalidate');
var secretKey = require('../../config').secret;

var mail = require('../helpers/mail').Mail;
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
                    if (user.emailVerified) {
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
                    } else {
                        res.status(401).json({
                            success: false,
                            message: 'Cuenta no activada'
                        });
                    }
                }
            });
        }

    });
});

// route to register a user (POST http://localhost:8080/api/user/signup)
router.post('/user/signup', function(req, res) {

    var new_user = new User(req.body);
    new_user.verificationToken = rand.generateKey();

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
            console.log('User saved successfully');
            console.log(data);
            data.success = true;

            var host = req.headers.host;
            var url = 'http://' + host + '/api/user/activation/' + new_user.verificationToken;
            var link = `<a href="${url}">${url}</a>`;
            var body = `Ha solicitado la creación de una cuenta en la comunidad de programadores IV Devs<br/>` +
                `Es necesario que actives la cuenta en el siguiente vinculo ${link}`;
            mail.send('Comunidad IV Devs', 'contacto@ivdevs.com', new_user.email, 'Activación de cuenta', body, function(err, json) {
                console.log('Mail sent with verification token');
                res.status(200).json(data).end();
            });
        }
    });
});

router.put('/user/', validateToken, function(req, res) {
    var id = req.body._id;
    var user_post = new User(req.body);

    var $match = {_id: id }    
    User.update($match,{ $set : user_post } ,function(err, data){
        if(err){res.send(err)}
        res.status(200).json(data).end();
    })

});

router.get('/user/activation/:token', function(req, res) {
    //TODO: activar cuenta con token
    User.findOne({
        verificationToken: req.params.token
    }, function(err, user) {

        if (err) {
            res.status(500).send(err);
        } else {
            if (user !== null) {
                user.emailVerified = true;
                user.verificationToken = null;
                user.save(function(err, data) {
                    if (err) res.status(500).send(err);
                    else {
                        console.log(data);
                        res.send({
                            success: true,
                            message: "Cuenta activada"
                        });
                    }
                });
            } else {
                res.status(500)
                    .send({
                        success: true,
                        message: "TOKEN no encontrado o cuenta ya activada"
                    });
            }
        }
    });

});

router.post('/user/recovery/', function(req, res) {
    //TODO: recuperación de contraseña
});

// route to view a user data by token (POST http://localhost:8080/api/user/me)
router.get('/user/me', validateToken, function(req, res) {
    var user = req.decoded._doc;

    var filters = {
        _id: user._id
    };

    User.find(filters, function(err, users) {
        res.json(users);
    });
});

module.exports = router;