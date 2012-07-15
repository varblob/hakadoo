var app = require('flatiron').app
  , async = require('async')
  , Set = require('Set')
  , Users = require('../models/users')
  , Battle = require('../models/memory/battle')
  , Questions = require('../models/memory/questions')
  ;

// Users seeking any other opponent
var waitingPool = [];

// Users seeking a specific opponent
var challengeList = {};

// Interval at which waiting users are paired together to battle
var waitingInterval = 5000 // ms
setInterval(matchMaker, waitingInterval);

module.exports = function(socket) {
 
  var userID = socket.handshake.session.userID;   
  socket.on('joinWaitingPool', joinWaitingPool.bind(this, userID));
  socket.on('postChallenge', postChallenge.bind(this, userID));

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
function joinWaitingPool(userID, data) {
  waitingPool.push(userID);
}

/*
 * This function is called regularly to pair together players in the 
 * `waitingPool`. As of now, it simply matches them together randonly. However,
 * this is where more advanced pairing logic will go in the future.
 */
function matchMaker() {

  while (waitingPool.length > 1) {
    launchBattle(waitingPool.shift(), waitingPool.shift());
  }
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

  Users.get(userID, this.e(function(user) {
    var userName = user.name;

    if (challengeList[opponentName] === userName) {
      delete challengeList[opponentName];

      Users.get({name: opponentName}, this.e(function(opponent) {
        var opponentID = opponent._id;
        launchBattle(userID, opponentID);
      }));
    } else {
      challengeList[userName] = opponentName;
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
  var question = Questions[~~(Math.random() * Questions.length)];
  var battle = new Battle(userID1, userID2, question);

  [userID1, userID2].forEach(function(userID) {
    app.userIDToBattle[userID] = battle;
    var socket = app.userIDToSocket[userID];
    socket.emit('battle');
  });
}
