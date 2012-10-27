var app = require('flatiron').app
  , async = require('async')
  , Set = require('Set')
  , oop = require('../util/oop')
  , Users = require('../models/users')
  , Matches = require('../models/matches')
  , Battle = require('../models/memory/battle')
  , Questions = require('../models/memory/questions')
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
      , opponentID = players[1 ^ players.indexOf(userID)]
      , question = Questions[battle.questionID];

    // Send the players' profile information
    Users.findOne({_id: opponentID}, this.e(function(opponent) {
      Users.findOne({_id: userID}, this.e(function(user) {
				var i;
				question.answers = [];
				//push the answers onto the question so the client can test
				for(i = 0; i<question.alwaysTest.length; i++){
					question.answers.push(question.answer(question.alwaysTest[i]));
				}
        socket.emit('ready', {
          user: user
        , opponent: opponent
        , battle: battle.data()
        , question: question
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
    ['remove', 'swap', 'peek'].forEach(function(attackName) { 

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
		
		function checkAnswer(test, answer){
	  	var i;
	  	if(test instanceof Array){
	  		for(i=0; i<test.length; i++){
	  			if(test[i] !== answer[i]){
	  				return false;
	  			}
	  		}
	  		return true;
	  	}else{
	  		return test === answer;
	  	}
	  	
	  }

    /*
     * Verifying a proposed solution
     */
    socket.on('compile', function(data) {
      var i
      	, userAnswers = data.answers
      	, rightAnswers = question.alwaysTest.map(function(input) {
		        return question.answer(input);
		      });
		  // if the client thinks it worked double check
			if(data.worked){
	      for(i=0; i<rightAnswers.length; i++) {
	        if (!checkAnswer(userAnswers[i], rightAnswers[i])) {
	          // The solution is incorrect
	          socket.emit('user:compile', {worked: false});
	          return;
	        }
	      }
				//TODO add random tests
				
	      // The solution is correct
	      socket.emit('user:compile', {worked: true});
	      app.messages(opponentID, 'lose');
	      battle.end(userID, self.e(function() {}));
     	}else{
     		app.messages(opponentID, 'opponent:compile', data);
     	}
    });


    /*
     * The opponent has solved the problem
     */
    app.messages[userID].on('lose', function() {
      socket.emit('lose');
    });
    
    app.messages[userID].on('opponent:compile', function(data){
    	socket.emit('opponent:compile', data);
    });

    
    /*
     * The battle has timed out
     */
    socket.on('timeout', function(data) {
      socket.emit('lose');
      app.messages(opponentID, 'lose');
      battle.end(null, self.e(function() {}));
    });
  }));
};
