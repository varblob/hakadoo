/*
 * battle.js
 *
 * This exports an object which manages the state of a battle as it takes 
 * place. This is not a MongoDB model, but rather just an object to be kept 
 * in memory as the server runs.
 */
var gameDuration = 5 * 60 * 1000 // ms
  , initialAttacks = {
      peek: 3
    , nuke: 3
    , swap: 3
  };


/*
 * Initial state for a battle between the given users
 * @param (String) userID1
 * @param (String) userID2
 * @param (String) questionID
 */
function Battle(userID1, userID2, questionID) {
  var self = this;
  self.questionID = questionID;
  self.timeRemaining = gameDuration;
  self.playerStates = {};

  [userID1, userID2].forEach(function(userID) {
    self.playerStates[userID] = {
      text: ''
    , attacks: initialAttacks
    }
  });
}


/*
 * Updates the text of the given user
 * @param (String) userID
 * @param (String) text
 */
Battle.prototype.updateText = function(userID, text) {
  this.playerStates[userID].text = text;
}

// Expose the Battle object
module.exports = Battle;
