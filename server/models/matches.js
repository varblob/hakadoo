var resourceful = require('resourceful-mongo')
  , config = require('flatiron').app.config
  ;

var Matches = module.exports = resourceful.define('matches', function() {
  this.use('mongodb', {
    uri: config.get('mongoURI')
  , collection: 'matches'
  });

  // Keep track of the match time
  this.timestamps()

  // The question this match was over
  this.string('questionID');

  // UserIDs  the two players involved in the match
  this.array('playerIDs').conform(function(IDs) {
    return IDs.length === 2;
  });

  // The winner of the match
  // Note: there might not be a winner
  this.string('winnerID')
});
