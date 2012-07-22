var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ;

var Matches = new Schema({
  matchDate: Date

  // The question this match was over
, questionID: Number

  // UserIDs  the two players involved in the match
, playerIDs: Array

  // The winner of the match (there might not be a winner)
, winnerID: {any: {}}
});

Matches.path('playerIDs').validate(function(playerIDs) {
  return playerIDs.length === 2;
});

module.exports = mongoose.model('matches', Matches);
