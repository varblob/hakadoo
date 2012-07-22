var app = require('flatiron').app
  , async = require('async')
  , Set = require('Set')
  , oop = require('../util/oop')
  , Users = require('../models/users')
  ;


module.exports = function(socket) {
  var userID = socket.handshake.session.userID; 

  

  // Send the user to the lobby if he isn't in a battle
  if (!battle) {
    socket.emit('redirect', { url: '/lobby' });
    return;
  }

  var players = Object.keys(battle.playerStates);
  console.log(players);
  var opponentID = players[1 ^ players.indexOf(userID)];

  Users.findOne({_id: opponentID}, this.e(function(opponent) {
    socket.emit('test', {
      opponent: opponent.name
    });
  }));
};



/*

// The socket connection waiting for a partner
exports.single = null;

exports.startListening = function() {
    
    var userID = socket.handshake.session.userID;

    Users.get(userID, function(err, user) {
      if (err) return socket.disconnect();
      var partner;

      socket.user = user;

      // A partner is already waiting
      if (exports.single) {
        partner = exports.single;
        exports.single = null;
    
        // Battle logic...
        bindBattleLogic([socket, partner]);
    
      // Otherwise, this is an odd connection. Wait for a partner
      } else {
        exports.single = socket;
        socket.emit('waiting');
      }
    });
  });
};


function bindBattleLogic(players) {
  
  // Pick a random question from the db
  var currentQuestion = questions[~~(Math.random() * questions.length)];

  players.forEach(function(me, i) {
    var opponent = players[i^1];
    
    // Ready function sends the current question
    me.emit('ready', {
      me: me.user
    , opponent: opponent.user
    , question: currentQuestion
    });

    // When a player enters text, inform the opponent
    me.on('textEntered', function(data) {
      var text = data.text;
      opponent.emit('textUpdate', { text: text });
    });

    // For the battle actions, simply relay the command from player to player
    me.on('remove', function() {
      opponent.emit('remove');
    });

    me.on('swap', function() {
      opponent.emit('swap');
    });
    
    // Handle client compile events
    me.on('compile', function(data) {
      
      // If outputs is on the data object that means the client thinks that they all passed
      // We're just double checking the see if it's true
      if (data.outputs){
        currentQuestion.alwaysTest.forEach(function(test, i){
          if (data.outputs[i] !== currentQuestion.answer(test)) {
            data.worked = false;
            me.emit('cheating', {msg:'<div><h1>Hey you there!</h1>'
              + '<p>Are you messing with the client code?</p>'
              + '<p>If so we would like to enlist your help in improving hackadoo.</br>'
              + '  E-mail us at team@hackadoo.com</p>'});
          }
        });
      }
      
      // TODO: We need to add a second step that sends back some random inputs back to the client
      // this is so that the client can't just write a bunch of if statements to handle the unit tests      
      
      // send the compile status to the opponent
      opponent.emit('compile', {worked:data.worked});
    });

    me.on('peek', function() {
      opponent.emit('peek');
    });
  });
}
*/
