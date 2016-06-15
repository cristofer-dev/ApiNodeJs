var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
const assert = require('assert');

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User = require('./app/models/user'); // get our mongoose model

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database, function(err, db) {
    assert.equal(err, null);
}); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// basic route
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});


var users = require('./app/routes/users');
app.use('/api', users);

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);


// =======================
// Create User test ======
// =======================
app.post('/setup', function(req, res) {

    // create a sample user
    var nick = new User({
        username: 'Juan22',
        password: 'Juan',
        email: 'casdl@asd-s.cl',
        admin: true
    });

    // save the sample user
    nick.save(function(err) {
        if (err) {
            var msg = '';
            if (err.hasOwnProperty('errmsg'))
                msg = err.errmsg;
            else msg = err.errors;

            console.error(err);
            res.status(500).json({
                message: msg
            }).end();
        } else {
            console.log('User saved successfully');
            res.status(200).json({
                success: true
            }).end();
        }
    });
});