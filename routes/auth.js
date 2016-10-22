var express = require('express');
var router = express.Router();
var User = require('../models/User');
var db = require('../models/db');

db.then(function(connection) {
  var userCollection = connection.collection('usercollection');

  /* Logging in */
  router.post('/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    userCollection.find({ username : username }).toArray(function(err, result) {
      if (err) {
        throw err;
      }

      if (result[0].password.toString() === password.toString()) {
        res.status(200).send('User Logged In');
      } else {
        res.status(500).send('something blew up');
      }
    });
  });

  /* Signing in. */
  router.post('/signin', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    // var newUser2 = new User({ username: username, password: password, companies: companies });
    var newUser = { username: username, password: password, companies: []};

    // Save to DB and return new user
    userCollection.insert(newUser, function (err, data) {
      if (err) {
        throw err;
      }

      res.send(newUser);
    });
  });
});

module.exports = router;
