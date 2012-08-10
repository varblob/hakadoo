var app = require('flatiron').app
  , async = require('async')
  , Set = require('Set')
  , oop = require('../util/oop')
  , Users = require('../models/users')
  , Battle = require('../models/memory/battle')
  ;


module.exports = function(socket) {
  var self = this
    , userID = socket.handshake.session.userID
    ;
 
  Battle.getBattleForUser(userID, this.e(function(battle) {

    // Send the user to the lobby if he isn't in a battle
    if (!battle) {
      socket.emit('redirect', { url: '/lobby' });
      return;
    }

    var players = Object.keys(battle.players)
      , opponentID = players[1 ^ players.indexOf(userID)];

    // Send the players' profile information
    Users.findOne({_id: opponentID}, this.e(function(opponent) {
      Users.findOne({_id: userID}, this.e(function(user) {
        socket.emit('ready', {
          user: user
        , opponent: opponent
        , battle: battle.data()
        });
      }));
    }));

    /*
     * Text updates
     */
    socket.on('textEntered', function(data) {
      var text = data.text;
      battle.updateText(userID, text, self.e(function() {
        app.messages(opponentID, 'opponentText', {text: text});
      }));
    });

    app.messages[userID].on('opponentText', function(data) {
      var text = data.text;
      battle.players[opponentID].text = text;
      socket.emit('textUpdate', data);
    });
   

    /*
     * Attacks
     */
    ['nuke', 'swap', 'peek'].forEach(function(attackName) { 

      // User attacks
      socket.on(attackName, function() {
        battle.attack(userID, attackName, self.e(function(success) {
          if (success) {
            app.messages(opponentID, attackName);
          }
        }));
      });

      // Opponent attacks
      app.messages[userID].on(attackName, function() {
        battle.players[opponentID].attacks[attackName]--;
        socket.emit(attackName);
      });
    });
  }));
};
