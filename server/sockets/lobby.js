var app = require('flatiron').app
  , async = require('async')
  , Set = require('Set')
  , Users = require('../models/users')
  , Matches = require('../models/matches')
  , Battle = require('../models/memory/battle')
  , Questions = require('../models/memory/questions')
  ;

// Interval at which waiting users are paired together to battle
var waitingInterval = 5000 // ms
setInterval(matchMaker, waitingInterval);

module.exports = function(socket) { 
  var userID = socket.handshake.session.userID;

  Battle.getBattleForUser(userID, this.e(function(battle) {
  
    // If the user is already in a battle, send him to the battle page
    if (battle) {
      socket.emit('startBattle');
      return;
    }

    socket.on('joinWaitingPool', joinWaitingPool.bind(this, userID));
    socket.on('postChallenge', postChallenge.bind(this, userID));

    // Retrieve the user information and give it to the client.
    Users.findOne({_id: userID}, this.e(function(user) {
      socket.emit('profile', user);
    }));

    // Give the client a list of active users on the site
    app.store.smembers('onlineUsers', this.e(function(userIDs) {
      userIDs.forEach(function(userID) {
        userLoggedIn(userID, socket);
      });
    }));

    app.messages['global'].on('userLoggedIn', function(data) {
      var userID = data.userID;
      userLoggedIn(userID, socket);
    });

    app.messages['global'].on('userLoggedOut', function(data) {
      socket.emit('userLoggedOut', {userID: userID});
    });

    // Listen for the startBattle message, indicating an opponent has been
    // registered and the battle data has been prepared
    app.messages[userID].on('startBattle', function() {
      socket.emit('startBattle');
    });
  
  }));
};


/*
 * Adds the connected user to the general pool of waiting users
 * @param (String) userID
 */
function joinWaitingPool(userID) {
  app.store.sadd('waitingPool', userID);
}


/*
 * This function is called regularly to pair together players in the 
 * `waitingPool`. As of now, it simply matches them together randonly. However,
 * this is where more advanced pairing logic will go in the future.
 */
function matchMaker() {
  var pairsRemain = true;
  
  async.whilst(
    function() {
      return pairsRemain;
    }
  , function(cb) {
      app.store.scard('waitingPool', function(err, n) {
        if (err) throw err;
        pairsRemain = n > 1;

        if (pairsRemain) {
          app.store.spop('waitingPool', function(err, userID1) {
            if (err) throw err;
            app.store.spop('waitingPool', function(err, userID2) {
              if (err) throw err;
              launchBattle(userID1, userID2);
              cb();
            });
          });

        } else {
          cb();
        }
      });
    }
    , function() {}
  );
}


/*
 * Posts a challenge for another user given by the Twitter handle 
 * `data.opponentName`. If a reciprocal challenge has been posted, launch the 
 * battle between the two users.
 * @param (Object) data
 * @param (Object) userID
 */
function postChallenge(userID, data) {
  var opponentName = data.opponentName;

  Users.findOne({_id: userID}, this.e(function(user) {
    var userName = user.name;

    app.store.hmget('challengeList', opponentName, this.e(function(val) {

      if (val[0] === userName) {
        app.store.hdel('challengeList', userName);

        Users.findOne({name: opponentName}, this.e(function(opponent) {
          var opponentID = opponent._id;
          launchBattle(userID, opponentID);
        }));
      } else {
        app.store.hmset('challengeList', userName, opponentName);
      }
    }));
  }));
}


/*
 * Launches the battle between the two given users
 * @param (String) userID1
 * @param (String) userID2
 */
function launchBattle(userID1, userID2) {

  // Initialize battle state object
  Battle.startNewBattle(userID1, userID2, function() { 
    [userID1, userID2].forEach(function(userID) {
      app.messages(userID, 'startBattle');
    }); 
  });
}


/*
 * Notify the client that the user given by `userID` is logged in
 * @param (String) userID
 * @param (Socket) socket
 * @param (Function) cb
 */
function userLoggedIn(userID, socket, cb) {
  cb = cb || function() {};

  Users.findOne({_id: userID}, function(err, user) {
    if (err) return cb(err);

    // Determine how many battles the user has played
    Matches.find({playerIDs: userID}, function(err, matches) {
      user._doc.battles = matches.length;
      socket.emit('userLoggedIn', {
        user: user
      });
    });
  });
}
