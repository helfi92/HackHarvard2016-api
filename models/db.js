const MongoClient = require('mongodb').MongoClient;

module.exports = new Promise(function(resolve, reject) {
  MongoClient.connect('mongodb://localhost:27017/hackharvard2106', function(err, db) {
    if (err) {
      reject(err);
      throw err;
    }

    resolve(db);
  });
});
