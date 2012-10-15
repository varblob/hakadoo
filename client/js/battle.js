;(function() {'use strict';

  // Connect to socket.io
  var socket = $.io.connect(window.Array.host);

  // Battle page state
  var battle;

  // Player for whom this page is loaded
  var user;

  // Opponent of the user
  var opponent;

  // Game options
  var options = {
    censorChar: '\u25A0'
  , peekTime: 1500
  }


  /*
   * Static class for handling all dynamic DOM manipulation
   */
  var Template = {
  
    /*
     * Load the jQueries for sections of the page which need to be templated 
     */
    initSections: function() {
      this.sections = {
        challengeText: $('#challenge_text')
      , compile: $('#compile_button') 
      , console: $('#console') 
      , timer: $('#timer')
      , buttons: {
          user: $('.buttons.left')
        , opponent: $('.buttons.right')
        } 
      , userInfo: {
          user: $('.user_info.left')
        , opponent: $('.user_info.right')
        }
      };
    }


    /*
     * Load the coding environments
     */
  , initCodeMirrors: function() {

      // Set up CodeMirror 'hackadoo' key mapping
      $.CodeMirror.keyMap.hackadoo = {
        'Ctrl-Enter': function() {
          compileHandler();
        },
        'fallthrough': ['basic']
      };
 
      $('#user_code, #opponent_code').live('cut copy paste', function(e) {
        e.preventDefault();
      });

      this.codeMirrors = {
        user: $.CodeMirror.fromTextArea($("#user_code").get(0), {
          lineNumbers: true
        , matchBrackets: true
        , keyMap: 'hackadoo'
        , theme: 'night'
        , autofocus: true
        , smartIndent: false
        , onChange: function(e) {
            var text = Template.codeMirrors.user.getValue();
            socket.emit('textEntered', {text: text});
          }
        })
      , opponent: $.CodeMirror.fromTextArea($("#opponent_code").get(0), {
          lineNumbers: true
        , matchBrackets: true
        , theme: 'night'
        , readOnly: 'nocursor'
        })
      }
    }


    /*
     * Template static information about the battle
     */
  , staticInformation: function() {
      this.sections.challengeText.text(battle.question.question);

      // Pair the user and opponent with their respective info box elements
      [
        {
          player: user
        , $box: this.sections.userInfo.user
        }
      , {
          player: opponent
        , $box: this.sections.userInfo.opponent
        }
      ].forEach(function(p) {

        // Set the player's avatar
        p.$box
          .find('.avatar')
          .css('background-image', 'url("' + p.player.avatar + '")');

        // Set the player's Twitter handle and link to his account
        p.$box
          .find('.username')
          .text(p.player.name)
          .attr('href', 'http://twitter.com/' + user.name);
      });
    }


    /*
     *  Set the timer to have a time string corresponding to the given 
     * `remaining` time in seconds
     */
  , setTimer: function(remaining) {
      var timeString = $.hackadoo.utils.zeroPad(Math.floor(remaining/60), 2) 
        + ':' + $.hackadoo.utils.zeroPad(remaining % 60, 2);
      this.sections.timer.text(timeString);
    }


    /*
     * Template the user attack buttons
     * @param (Object) attacks
     * @param (String) userOrOpponent
     */
  , attackButtons: function(attacks, userOrOpponent) {
      var $buttons = this.sections.buttons[userOrOpponent];

      Object.keys(attacks).forEach(function(attackName) {
        var attackCount = attacks[attackName];
        var $attackButton = $buttons.find('.' + attackName);
        $attackButton.toggleClass('disabled', attackCount === 0);
        $attackButton.find('.count').text(attackCount); 
      });
    }
  };

 

  /*
   * The game countdown clock. This is responsible for initializing the 
   * countdown, updating it over time, and ending the game when it reaches 0.
   */
  var Timer = {

    /*
     * Initalize the countdown timer with the given number of milliseconds
     * @param (Number) seconds
     * @param (Function) onZero
     */
    start: function(seconds, onZero) {
      this.seconds = seconds;
      this.onZero = onZero;
      this.timer = setInterval(this._step.bind(this), 1000);
    }

    /*
     * Account for a single elpased second; update the timer accordingly
     */
  , _step: function() {
      console.log('steppin');

      if (this.seconds <= 0) {
        console.log('>', this.timer);
        clearInterval(this.timer);
        return this.onZero();
      }

      this.seconds--;
      Template.setTimer(this.seconds);
    }
  }


  $(document).ready(function() {

    Template.initSections();
    Template.initCodeMirrors();

    /*
     * Receive initial data from the server about the battle and the players. 
     * Set up the game view.
     */
    socket.on('ready', function(data) {

      // Set up battle state variables
      user = data.user;
      opponent = data.opponent;
      battle = data.battle;
      battle.question = data.question;

      // Perform initial templating
      Template.staticInformation();
      Template.attackButtons(battle.players[user._id].attacks, 'user');
      Template.attackButtons(battle.players[opponent._id].attacks , 'opponent');

      // Set up inital user and opponent text
      Template.codeMirrors.user.setValue(battle.players[user._id].text);
      Template.codeMirrors.opponent.setValue(censor(battle.players[opponent._id].text));
      
      // Start the game timer
      var timeRemaining = ~~((battle.gameStop - Date.now()) / 1000); 
      Timer.start(timeRemaining, function() {
        socket.emit('timeout'); // XXX ought to be handled server-side
      });
    });


    /*
     * The opponent has used the peek attack
     */
    socket.on('peek', receiveAttack.bind(this, 'peek'));


    /*
     * The opponent has used the swap attack
     */
    socket.on('swap', function() {
      var text = Template.codeMirrors.user.getValue().split('')
        , swap = Math.floor(Math.random() * text.length - 1)
        , holder = text[swap]
        ;

      text[swap] = text[swap + 1];
      text[swap + 1] = holder;
      Template.codeMirrors.user.setValue(text.join(''));
      receiveAttack('swap');
    });


    /*
     * The opponent has used the nuke attack
     */
    socket.on('nuke', function() {
      var lines = Template.codeMirrors.user.getValue().split('\n')
        , killLine = Math.floor(Math.random() * lines.length)
        , newText = lines.filter(function(line, i) {
            return i !== killLine;
          }).join('\n');

      Template.codeMirrors.user.setValue(newText);
      receiveAttack('nuke');
    });


    /*
     * The opponent has entered text
     */
    socket.on('textUpdate', function(data) {
      var opponentText = battle.players[opponent._id].text = data.text;
      Template.codeMirrors.opponent.setValue(censor(opponentText));
    });


    /*
     * The opponent has won
     */
    socket.on('lose', function() {
      $.fancybox('<h1>You Lose!</h1>');
    });


    /*
     * The server has finished evaluating a solution attempt
     */
    socket.on('compile', function(data) {
      if (data.success) {
        $.fancybox('<h1>You Win!</h1>');
      } else {
        $('#console').prepend('<li>Failed to pass unit tests</li>');
      }
    });


    /*
     * If they cheat, lets get their help in making Hackadoo better!
     */
    socket.on('cheating', function() {
      $.fancybox('[cheating message]');
    });


    /*
     * Redirect to a different page
     */
    socket.on('redirect', function(data) {
      window.location = data.url;
    });


    /*
     * Use the swap attack
     */
    Template.sections.buttons.user.find('.swap')
      .click(useAttack.bind(this, 'swap'));


    /*
     * Use the nuke attack
     */
    Template.sections.buttons.user.find('.nuke')
      .click(useAttack.bind(this, 'nuke'));


    /*
     * Use the peek attack
     */
    Template.sections.buttons.user.find('.peek').click(function() {

      if (useAttack('peek')) {
        var opponentText = battle.players[opponent._id].text;
        Template.codeMirrors.opponent.setValue(opponentText);

        setTimeout(function() {
          var opponentText = battle.players[opponent._id].text;
          Template.codeMirrors.opponent.setValue(censor(opponentText));
        }, options.peekTime);
      }
    });


    /*
     * Attempt a solution
     */
    Template.sections.compile.click(function() {
      var solution = Template.codeMirrors.user.getValue();
      compileHandler(solution);
    });
  }); 


  /*
   * Replace the alphanumeric characters of a string with unicode blocks
   * @param (String) text
   * @return (String)
   */
  function censor(text) {
    return text.replace(/\w/g, options.censorChar);
  }


  /*
   * Perform the given attack, alerting the server and updating the DOM
   * @param (String) attackName
   * @return (Boolean)
   */
  function useAttack(attackName) {
    var playerAttacks = battle.players[user._id].attacks; 

    if (playerAttacks[attackName] > 0) {
      playerAttacks[attackName]--;
      socket.emit(attackName);
      Template.attackButtons(playerAttacks, 'user');
      return true;
    }

    return false;
  }


  /*
   * Update the game to reflect that the opponent has performed an attack
   * @param (String) attackName
   */
  function receiveAttack(attackName) {
    var opponentAttacks = battle.players[opponent._id].attacks;
    opponentAttacks[attackName]--;
    Template.attackButtons(opponentAttacks, 'opponent');
  }
  
  
  /*
   * compile handler helpers 
   */
  function _generateOutputs(question, userCode){
    var attempt = eval('(' + userCode + ')')
      , outputs = []
      , i ;
      
    // Pass all the required tests
    for(i = 0; i < question.alwaysTest.length; i++){
      outputs.push(_getOutput(attempt,question.alwaysTest[i]));        
    }
    return outputs;
  }
  
  function _getOutput(f, input){
  	trace('hi');
  	return f(input);
  }


  /*
   * Runs the given solution on all of the test cases for the given question, 
   * then sends the outputs to the server for validation.
   * @param (String) solution
   */
  function compileHandler(solution) {
    try {
      var outputs = _generateOutputs(battle.question, solution);
      console.log(outputs);
      socket.emit('compile', {answers: outputs});
      Template.sections.console.prepend('<li>Running tests...</li>');
    } catch(e) {
      Template.sections.console
        .prepend('<li>' + e.name + ': ' + e.message + '</li>');  
    }
  } 

})();
