// =======================
// get the packages we need ============
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model
var validateToken = require ('./app/middlewares/tokenvalidate');
    
// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// API ROUTES -------------------
// we'll get to these in a second

// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)

// route middleware to verify a token

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Bienvenido a la API de IV Devs... La Comunidad mas Cool!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res, validateToken) {
  User.find({}, function(err, users) {    
    res.json(users);
  });
});   

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    username: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
          if (err) throw err;
          
          if (!isMatch) {
            res.json({ success: false, message: 'Authentication failed. Wrong password.' });
          } else {

            // if user is found and password is right
            // create a token        
            var token = jwt.sign(user, app.get('superSecret'));

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
      res.status(500).json({message: msg}).end();
    }else{
      console.log('User saved successfully');
      res.status(200).json({ success: true }).end();
    }
  });
});
