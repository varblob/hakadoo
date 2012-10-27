/*
 * battle.js
 *
 * This exports an object which manages the state of a battle as it takes 
 * place. This is not a MongoDB model, but rather just an object to be kept 
 * in memory as the server runs.
 */
var app = require('flatiron').app
  , async = require('async')
  , Matches = require('../matches')
  , Questions = require('./questions')
  , gameDuration = 5 * 60 * 1000 // ms
  , initialAttacks = {
      peek: 3
    , remove: 3
    , swap: 3
  };


/*
 * Object to handle battle state changes
 * @param (JSON) data
 */
function Battle(data) {

  // Parse to JSON object if given as string
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }

  this.update(data);
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
    , gameStop = gameStart + gameDuration
    , questionID = ~~(Math.random() * Questions.length)
    ;

  // Create a MongoDB document for the battle. The final battle state will
  // be stored here as a record of the match.
  Matches.create({
    matchDate: new Date(gameStart)
  , questionID: questionID
  , playerIDs: [userID1, userID2]
  }, function(err, match) {
    if (err) return cb(err);

    var data = {};
    data._id = match._id;
    data.questionID = questionID; 
    data.gameStart = gameStart;
    data.gameStop = gameStop;
    data.players = {};

    async.parallel([userID1, userID2].map(function(userID) {
      return function(cb) {
        data.players[userID] = {
          text: ' function(s) {\n\n\t// your code here\n\n\treturn s;\n}'
        , attacks: initialAttacks
        };

        app.store.hmset('userToBattle', userID, match._id, cb);
      };
    })
    , function(err) {
      if (err) return cb(err);
     
      var battle = new Battle(data);
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

    // Callback a null battle if the user isn't currently in a battle
    if (!battleID) return cb(null, null);

    app.store.hmget('battles', battleID, function(err, battleJSON) {
      if (err) return cb(err);
      battleJSON = battleJSON[0];

      cb(null, new Battle(battleJSON));
    });
  })
};


/*
 * Return an object representing the data of the Battle object. This is helpful
 * in serialization.
 * @return (Object)
 */
Battle.prototype.data = function() {
  return {
    _id: this._id
  , questionID: this.questionID
  , gameStart: this.gameStart
  , gameStop: this.gameStop
  , players: this.players
  };
};


/*
 * Overwrites the present battle state with the state given in the object `data`
 * @param (Object) data
 */
Battle.prototype.update = function(data) {
  this._id = data._id;
  this.questionID = data.questionID; 
  this.gameStart = data.gameStart;
  this.gameStop = data.gameStop;
  this.players = data.players;
};


/*
 * Serializes the object and saves it to the data store
 * @param (Function) cb
 */
Battle.prototype.save = function(cb) {
  var asJSON = JSON.stringify(this.data());
  app.store.hmset('battles', this._id, asJSON, cb);
};


/*
 * Retrieves the battle state from the data store
 * @param (Function) cb
 */
Battle.prototype.fetch = function(cb) {
  app.store.hmget('battles', this._id, function(err, asJSON) {
    if (err) return cb(err);
    this.update(JSON.parse(asJSON));
    cb(null);
  });
}


/*
 * End the battle, updating the data store as appropriate
 * @param (String) winnerID
 * @param (Function) cb
 */
Battle.prototype.end = function (winnerID, cb) {
  var self = this;

  Matches.findOne({_id: self._id}, function(err, match) {
    if (err) return cb(err);

    // If the match has already ended, do nothing
    if (typeof match.winnerID == 'undefined') return cb();

    // Record the battle outcome in the DB
    match.winnerID = winnerID;
    match.save(function(err, match) {
      if (err) return cb(err);
      
      // Remove the users from the user id to battle id lookup
      async.parallel(Object.keys(self.players).map(function(playerID) {
        return function(cb) {
          app.store.hdel('userToBattle', playerID, cb);
        };
      }), function(err) {
        if (err) return cb(err);

        // Remove the battle information
        app.store.hdel('battles', self._id, cb);
      })
    });
  });
};


/*
 * Updates the text of the given user
 * @param (String) userID
 * @param (String) text
 */
Battle.prototype.updateText = function(userID, text, cb) { 
  this.players[userID].text = text;
  this.save(cb);
}


/*
 * If the given attack is available to the user, decrement its corresponding
 * counter are callback success. Otherwise callback failure.
 * @param (String) userID
 * @param (String) attackName
 * @param (Function) cb 
 */
Battle.prototype.attack = function(userID, attackName, cb) {
  var attacks = this.players[userID].attacks; 

  if (attacks[attackName]) {
    attacks[attackName]--;
    this.save(function(err) {
      if (err) return cb(err);
      cb(null, true);
    });
  } else {
    cb(null, false);
  }
}


// Expose the Battle object
module.exports = Battle;
