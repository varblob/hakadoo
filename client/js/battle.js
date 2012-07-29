$(document).ready(function() {'use strict';

  //============== vars ===============
  var
    //some containers that are oft used
      leftContainer = $('#left_container')
    , rightContainer = $('#right_container')
    , leftButtons = leftContainer.find('.buttons')
    , rightButtons = rightContainer.find('.buttons')
    
    // Connect to socket.io
    , socket = $.io.connect(window.Array.host)

    // Game-specific information
    , userCode
    , opponentCode
    , opponentText
    , gameData = {}
    ;
    
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

  function censor(text) {
    return text.replace(/\w/g, '01');
  }

  // user data related
  function setAbility(store, ability, val, button) {
    store[ability] = val;
    if(gameData.user.attacks[ability] < 0) {
      button.toggleClass('disabled', true);
    } else {
      button.toggleClass('disabled', false);
    }
    button.find('.count').text(val > 0 ? val : 0);
    return val;
  }

  function useAbility(store, ability, button) {
    return setAbility(store, ability, store[ability] - 1, button) >= 0;
  }

  function updateAbilities(store, container) {
    console.log(']]]', store);
    var k;

    for (k in store) {
      container.find('.' + k + ' .count').text(store[k]);
      console.log(k, '.' + k + ' .count');
    }
  }
  
  function bindUserInfo(user, $box) {
    $box.find('.avatar').css('background-image', "url('" + user.avatar + "')");
    $box.find('.username').text(user.name);
    $box.find('.username').attr('href', 'http://twitter.com/' + user.name);
  }
  
  function bindUser(userData, container){
    var buttons = container.find('.buttons')
      , userInfo = container.find('.user_info');
    
    updateAbilities(userData.attacks, buttons);
    bindUserInfo(userData, userInfo);
  }
  
  //================= code ==================
  
  // initializing codemirror hakadoo keyMapping
  $.CodeMirror.keyMap.hakadoo = {
    'Ctrl-Enter': function(cm) {
      compileHandler();
    },
    'fallthrough': ['basic']
  };

  //create codeing panels
  userCode = $.CodeMirror.fromTextArea(document.getElementById("user_code"), {
    lineNumbers: true,
    matchBrackets: true,
    onChange: function(e) {
      var text = userCode.getValue();
      socket.emit('textEntered', {
        text: text
      });
    },
    keyMap: 'hakadoo',
    theme: 'night',
    autofocus: true
  });

  opponentCode = $.CodeMirror.fromTextArea(document.getElementById("opponent_code"), {
    lineNumbers: true,
    matchBrackets: true,
    theme: 'night',
    readOnly: 'nocursor'
  });

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
  socket.on('peek', function() {
    console.log('attack: peek');
    useAbility(gameData.opponent.attacks, 'peek', rightButtons.find('.peek'));
  });

  socket.on('swap', function() {
    console.log('attack: swap');
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

  socket.on('waiting', function(data) {
    $.console.log('waiting');
  });

  socket.on('ready', function(data) {

    // Set up VS box
    var timer;
        
    gameData.opponent = data.opponent;
    gameData.user = data.user;
    gameData.elapsed = 0;
    gameData.limit = 5 * 60;
 
    // set the current question
    gameData.question = data.question;
    
    function formatTime(remaining){
      return $.hackadoo.utils.zeroPad(Math.floor(remaining/60), 2) + ':' + $.hackadoo.utils.zeroPad(remaining % 60, 2);
    }
  
    // setting the challenge text
    $('#challenge_text').text(gameData.question.question);
    
    // start the timer
    // XXX: this should be a server event
    timer = setInterval(function() {
      gameData.elapsed++;
      gameData.remaining = gameData.limit - gameData.elapsed;
      
      $("#timer").html(formatTime(gameData.remaining));

      if (gameData.remaining === 0) { //timer finished
        clearInterval(timer);
        $('#console').prepend('<li>Time out. You BOTH lose!</li>');
      }
    }, 1000);

    // setting user profile info
    bindUser(gameData.user, leftContainer);
    bindUser(gameData.opponent, rightContainer);

    // Set up initial text for user and opponent
    opponentText = data.opponentText;
    userCode.setValue(data.text);
    opponentCode.setValue(censor(opponentText));
  });

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
});
