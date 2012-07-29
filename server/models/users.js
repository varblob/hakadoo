var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ;

var Users = new Schema({
  name: String
, avatar: String
, twitterID: String
, joinDate: Date
});

module.exports = mongoose.model('users', Users);
