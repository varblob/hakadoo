var socketIO = require('socket.io')
  , connect = require('connect')
  , flatiron = require('flatiron')
  , app = flatiron.app
  , Questions = require('./models/questions')
  , async = require('async')
  , oop = require('./util/oop');

// The socket connection waiting for a partner
exports.single = null;

exports.startListening = function() {

  var io = socketIO.listen(app.server);

  /* Note: commenting out on master to avoid blocking client-side work

  io.configure(function() {
    io.set('authorization', function(data, cb) {
      var cookies = connect.utils.parseCookie(data.headers.cookie) 
      data.auth = JSON.parse(cookies['connect.sess'].match(/\{.*\}/g)[0]);
      cb(null, true);
    });
  });

  io.on('connection', function(socket) {

    var auth = socket.handshake.auth;

    console.log(auth);

    var partner, players;

    socket.hakadoo = auth;

    // A partner is already waiting
    if (exports.single) {
      partner = exports.single;
      players = [socket, partner];
      exports.single = null;
  
      // Battle logic...
      bindBattleLogic(players);
  
    // Otherwise, this is an odd connection. Wait for a partner
    } else {
      exports.single = socket;
      socket.emit('waiting');
    }
  });

  */
};


/*
 * Binds the event for handling battle mechanics
 * @param (Array) players
 */ 
function bindBattleLogic(players) {
	'use strict';
	var currentQuestion;
  
  // Get all the questions 
  // XXX: If we have boat loads of questions we should probably figure out another way to do this
	Questions.getQuestions(function(questions){
		
		// Pick a random question from the db
		currentQuestion = questions[Math.random() * questions.length];
		 
    players.forEach(function(me, i) {
        var opponent = players[i^1];
				
				// Ready function sends the current question
        me.emit('ready', {opponent: opponent.hakadoo, question: currentQuestion});

        // When a player enters text, inform the opponent
        me.on('textEntered', function(data) {
          var text = data.text;
          opponent.emit('textUpdate', { text: text });
        });

        // For the battle actions, simply relay the command from player to player
        me.on('remove', function() {
          opponent.emit('remove', {});
        });

        me.on('swap', function() {
          opponent.emit('swap', {});
        });
				
				// Handle client compile events
        me.on('compile', function(data) {
        	
        	// If outputs is on the data object that means the client thinks that they all passed
        	// We're just double checking the see if it's true
					if(data.outputs){
						currentQuestion.alwaysTest.forEach(function(test, i){
							if(data.outputs[i] !== currentQuestion.answer(test)){
								data.worked = false;
								me.emit('cheating', {msg:'<div><h1>Hey you there!</h1> <p>Are you messing with the client code?</p> <p>If so we would like to enlist your help in improving hackadoo.</br>  E-mail us at team@hackadoo.com</p>'})
							}
					  });
					}
					
					// TODO: We need to add a second step that sends back some random inputs back to the client
					// this is so that the client can't just write a bunch of if statements to handle the unit tests
					
					
					// send the compile status to the opponent
					opponent.emit('compile', {worked:data.worked});
        });

        me.on('peek', function() {
          opponent.emit('peek', {});
        });
      });
  });
}
