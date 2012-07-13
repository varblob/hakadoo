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
  
  socket.on('joinWaitingPool', joinWaitingPool);
  socket.on('postChallenge', postChallenge);

  // Retrieve the user information and give it to the client.
  Users.get(userID, this.e(function(user) { 
    socket.emit('profile', user);
  }));


  /*
   * Adds the connected user to the general pool of waiting users
   */
  function joinWaitingPool() {
    waitingPool.add(userID);
  }


  /*
   * Posts a challenge for another user given by the Twitter handle 
   * `data.opponentName`. If a reciprocal challenge has been posted, launch the 
   * battle between the two users.
   * @param (Object) data
   */
  function postChallenge(data) {
    var opponentName = data.opponentName;

    User.find({name: opponentName}, this.e(function(user) {
      var opponentID = user._id;

      if (challengeList[opponentID] === userID) {
        delete challengeList[opponentID];
        launchBattle(userID, opponentID);
      } else {
        challengeList[userID] = opponentID;
      }
    }))
  }


  /*
   * Launches the battle between the two given users
   * @param (String) userID1
   * @param (String) userID2
   */
  function launchBattle(userID1, userID2) {
  
  }
};
