var async = require('async')
  , set = require('set')
  , oop = require('../util/oop')
  , Users = require('../models/users')
  ;

// Users seeking any other opponent
exports.generalPool = new Set();

// Users seeking a specific opponent
exports.challengerPool = new Set();

module.exports = function(socket) {

  var userID = socket.handshake.session.userID; 
  
  socket.on('joinGeneralPool', joinGeneralPool);
  socket.on('joinChallengerPool', joinChallengerPool);

  Users.get(userID, function(err, user) {
    
  });

  /*
   * Adds the connected user to the general pool of waiting users
   */
  function joinGeneralPool() {
    
  }


  /*
   * Adds the connected user to the pool of challenges for specific users
   */
  function joinChallengerPool(data) {
    
  }
};
