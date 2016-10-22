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
      res.send(result);
    });
  });

  /* Create new User */
  router.post('/', function (req, res, next) {
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

  /* Update user company list */
  router.put('/', function (req, res, next) {
    var username = req.body.username;
    var company = req.body.company;

    userCollection.find({ username : username }).toArray(function(err, result) {
      if (err) {
        throw err;
      }

      var index = result[0].companies.indexOf(company);
      if (index > -1) {
        result[0].companies.splice(index, 1);
      } else {
        result[0].companies.push(company);
      }

      userCollection.update({username:username}, {$set:{companies:result[0].companies}}, function (err, data) {
        if (err) {
          throw err;
        }
        res.send(data);
      });
    });
  });

  /* Delete user or Delete all if no username is provided*/
  router.delete('/', function (req, res, next) {
    var username = req.body.username;

    if (!username) {
      userCollection.remove();
      res.send(200);
    } else {
      userCollection.remove({ username: username }, function (err, data) {
        if (err) {
          throw err;
        }
        res.send(200);
      });
    }
  });
});

module.exports = router;
