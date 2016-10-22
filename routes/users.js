var express = require('express');
var router = express.Router();
var User = require('../models/User');
var db = require('../models/db');

db.then(function(connection) {
  var userCollection = connection.collection('usercollection');

  /* GET users listing. */
  router.get('/', function(req, res, next) {
    userCollection.find().toArray(function(err, result) {
      if (err) {
        throw err;
      }
    });
    res.send('respond with a resource');
  });

  /* Create new User */
  router.post('/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    // var newUser = new User({ username: username, password: password});
    var newUser = { username: username, password: password};

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
