// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  admin: Boolean,
  location: String,
  meta: {
    age: Number,
    website: String
  },
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;










// const db = require('./db');
//
// module.exports = db.then(function(connection) {
//   const collection = connection.collection('usercollection');
//
//   collection.find().toArray(function(err, result) {
//     if (err) {
//       throw err;
//     }
//
//     console.log('usercollection: ', result);
//   });
// });
