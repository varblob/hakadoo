/*
 * battle.js
 *
 * This exports an object which manages the state of a battle as it takes 
 * place. This is not a MongoDB model, but rather just an object to be kept 
 * in memory as the server runs.
 */
var app = require('flatiron').app
  , async = require('async')
  , Questions = require('./questions')
  , Matches = require('../matches')
  , gameDuration = 5 * 60 * 1000 // ms
  , initialAttacks = {
      peek: 3
    , nuke: 3
    , swap: 3
  };


/*
 * Object to handle battle state changes
 * @param (Object) data
 */
function Battle(data) {
  this.data = JSON.parse(data); 
}


/*
 * Factory method to create a new battle between the given users
 * @param (String) userID1
 * @param (String) userID2
 * @param (Function) cb
 */
Battle.startNewBattle = function(userID1, userID2, cb) { 
  var self = this
    , gameStart = Date.now()
    , questionID = ~~(Math.random() * Questions.length)
    ;

  // Create a MongoDB document for the battle. The final battle state will
  // be stored here as a record of the match.
  Matches.create({
    matchDate: new Date(gameStart)
  , questionID: questionID
  }, function(err, match) {
    if (err) return cb(err);

    // Everything within `self.data` must be JSON-serializable
    var data = {
      _id: match._id
    , question: Questions[questionID]
    , gameStart: gameStart
    , playerStates: {}
    };

    async.parallel([userID1, userID2].map(function(userID) {
      return function(cb) {
        data.playerStates[userID] = {
          text: ' function(s) {\n\n\t// your code here\n\n\treturn s;\n}'
        , attacks: initialAttacks
        };

        app.store.hmset('userToBattle', userID, match._id, cb);
      };
    })
    , function(err) {
      if (err) return cb(err);
     
      var battle = new Battle(JSON.stringify(data));
      battle.save(cb);
    });
  });
}


/*
 * If the given user is currently engaged in a battle, return the 
 * Battle object.
 * @param (String) userID
 * @param (Function) cb
 */
Battle.getBattleForUser = function(userID, cb) {
  app.store.hmget('userToBattle', userID, function(err, battleID) {
    if (err) return cb(err);
    battleID = battleID[0];

    app.store.hmget('battles', battleID, function(err, battleJSON) {
      if (err) return cb(err);
      battleJSON = battleJSON[0];

      cb(null, new Battle(battleJSON));
    });
  })
};


/*
 * Serializes the object and saves it to the data store
 * @param (Function) cb
 */
Battle.prototype.save = function(cb) {
  var asJSON = JSON.stringify(this.data);
  app.store.hmset('battles', this.data._id, asJSON, cb);
}


/*
 * Retrieves the battle state from the data store
 * @param (Function) cb
 */
Battle.prototype.fetch = function(cb) {
  app.store.hmget('battles', this.data._id, function(err, asJSON) {
    if (err) return cb(err);
    this.data = JSON.parse(asJSON);
    cb(null);
  });
}


/*
 * Updates the text of the given user
 * @param (String) userID
 * @param (String) text
 */
Battle.prototype.updateText = function(userID, text, cb) { 
  this.data.playerStates[userID].text = text;
  this.save(cb);
}


// Expose the Battle object
module.exports = Battle;
