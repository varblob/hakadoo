var app = require('flatiron').app
  , async = require('async')
  , set = require('set')
  , Users = require('../models/users')
  ;

// Users seeking any other opponent
var waitingPool = new Set();

// Users seeking a specific opponent
var challengeList = {};

module.exports = function(socket) {
  var userID = socket.handshake.session.userID; 
  
  socket.on('joinWaitingPool', joinWaitingPool.bind(null, userID));
  socket.on('postChallenge', postChallenge.bind(null, userID));

  // Retrieve the user information and give it to the client.
  Users.get(userID, this.e(function(user) { 
    socket.emit('profile', user);
  }));
};


/*
 * Adds the connected user to the general pool of waiting users
 * @param (Object) data
 * @param (String) userID
 */
function joinWaitingPool(data, userID) {
  waitingPool.add(userID);
}


/*
 * Posts a challenge for another user given by the Twitter handle 
 * `data.opponentName`. If a reciprocal challenge has been posted, launch the 
 * battle between the two users.
 * @param (Object) data
 * @param (Object) userID
 */
function postChallenge(data, userID) {
  var opponentName = data.opponentName;

  User.find({name: opponentName}, this.e(function(user) {
    var opponentID = user._id;

    if (challengeList[opponentID] === userID) {
      delete challengeList[opponentID];
      launchBattle(userID, opponentID);
    } else {
      challengeList[userID] = opponentID;
    }
  }));
}


/*
 * Launches the battle between the two given users
 * @param (String) userID1
 * @param (String) userID2
 */
function launchBattle(userID1, userID2) {
  // Initialize battle state object
  // Map userIDs to battle state with app.userIDToBattle

  [
    app.userIDToSocket[userID1]
  , app.userIDToSocket[userID2]
  ]
  .forEach(function(socket) {
    socket.emit('battle');
  });
}
