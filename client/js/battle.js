;(function() {'use strict';

  // Connect to socket.io
  var socket = $.io.connect(window.Array.host);

  // Battle page state
  var battle;

  // Player for whom this page is loaded
  var user;

  // Opponent of the user
  var opponent;


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

      this.codeMirrors = {
        user: $.CodeMirror.fromTextArea($("#user_code").get(0), {
          lineNumbers: true
        , matchBrackets: true
        , keyMap: 'hackadoo'
        , theme: 'night'
        , autofocus: true
        , smartIndent: false
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
      this.timer = setInterval(this._step.bind(this), 1000);
    }

    /*
     * Account for a single elpased second; update the timer accordingly
     */
  , _step: function() {

      if (this.seconds <= 0) {
        clearInterval(this.timer);
        return onZero();
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

      // Perform initial templating
      Template.staticInformation();
      Template.attackButtons(battle.players[user._id].attacks, 'user');
      Template.attackButtons(battle.players[opponent._id].attacks , 'opponent');

      // Set up inital user and opponent text
      Template.codeMirrors.user.setValue(battle.players[user._id].text);
      Template.codeMirrors.opponent.setValue(battle.players[opponent._id].text);
      
      // Start the game timer
      var timeRemaining = ~~((battle.gameStop - Date.now()) / 1000); 
      Timer.start(timeRemaining);

      /* , onChange: function(e) {
          var text = userCode.getValue();
          socket.emit('textEntered', {
            text: text
          });
        },*/
    });


    /*
     * The opponent has used the peek attack
     */
    socket.on('peek', receiveAttack.bind(this, 'peek'));


    /*
     * The opponent has used the swap attack
     */
    socket.on('swap', function() {
      var text = userCode.getValue().split(''), swap = Math.floor(Math.random() * text.length - 1), holder = text[swap];

      useAbility(gameData.opponent.attacks, 'swap', rightButtons.find('.swap'));
      text[swap] = text[swap + 1];
      text[swap + 1] = holder;
      userCode.setValue(text.join(''));
    });

    socket.on('nuke', function() {
      console.log('attack: nuke');
      var lines = userCode.getValue().split('\n')
        , killLine = Math.floor(Math.random() * lines.length)
        , newText = lines.filter(function(line, i) {
            return i !== killLine;
          }).join('\n');

      useAbility(gameData.opponent.attacks, 'nuke', rightButtons.find('.nuke'));
      userCode.setValue(newText);
    });

    socket.on('textUpdate', function(data) {
      console.log('got text update');
      opponentText = data.text;
      opponentCode.setValue(censor(data.text));
    });




  });


  /*
   * Replace the alphanumeric characters of a string with unicode blocks
   * @param (String) text
   * @return (String)
   */
  function censor(text) {
    return text.replace(/\w/g, '\u25A0');
  }


  /*
   * Perform the given attack, alerting the server and updating the DOM
   * @param (String) attackName
   */
  function useAttack(attackName) {
    var playerAttacks = battle.players[user._id].attacks; 

    if (playerAttacks[attackName] > 0) {
      playerAttacks[attackName]--;
      socket.emit(attackName);
      templateAttackButtons(playerAttacks, 'user');
    }
  }

  /*
   * Update the game to reflect that the opponent has performed an attack
   * @param (String) attackName
   */
  function receiveAttack(attackName) {
    var opponentAttacks = battle.players[opponent._id].attacks;
    opponentAttacks[attackName]--;
    templateAttackButtons(opponentAttacks);
  }

})();


  /*
    socket.on('lose', function() {
      $.fancybox('<h1>You Lose!</h1>');
      $('#console').prepend('<li>You lose!</li>');
    });
    
    // if they cheat lets get their help in making hackadoo better!
    socket.on('cheating', function(data){
      $.fancybox(data.msg);
    });
    
    // response from user event
    socket.on('user:compile', function(data){
      if(data.worked){
        $.fancybox('<h1>You Win!</h1>');
        $('#console').prepend('<li>You Win!</li>');
      }else{
        $('#console').prepend('<li>Failed to pass unit tests</li>');
      }
    });
 
    //=============== functions ==================
    function compileHandler() {
      var worked = false
        , outputs;

      try {
        outputs = $.hakadoo.validator.generateOutputs(gameData.question, userCode.getValue());
        socket.emit('compile', {outputs:outputs, worked:true});
      } catch(e) {
        $('#console').prepend('<li>' + e.name + ': ' + e.message + '</li>');
        socket.emit('compile', {
          worked: false
        });
      }    
    } 
    
    //================= code ==================
    

    // init questions
    $('#challenge_text').text("Waiting for an opponent...");

    // binding click handlers
    $('#compile_button').click(function() {
      compileHandler();
    });

    leftButtons.find('.swap').click(function() {
      if(useAbility(gameData.user.attacks, 'swap', leftButtons.find('.swap'))) {
        socket.emit('swap');
      }
    });

    leftButtons.find('.nuke').click(function() {
      if(useAbility(gameData.user.attacks, 'nuke', leftButtons.find('.nuke'))) {
        socket.emit('nuke');
      }
    });

    leftButtons.find('.peek').click(function() {
      if(useAbility(gameData.user.attacks, 'peek', leftButtons.find('.peek'))) {
        console.log('---> *** :)', opponentText);
        opponentCode.setValue(opponentText);
        setTimeout(function() {
          opponentCode.setValue(censor(opponentText));
        }, 1500);
        socket.emit('peek');
      }
    });

    // Disable Cut, Copy and Paste in the Code Mirror
    $(".CodeMirror*").live("cut copy paste", function(e) {
    e.preventDefault();
    });


    //================= socket listeners ==================
  */
