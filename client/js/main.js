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

		// User Consumables
		// XXX: this should probably be game dependent
		, defaultConsumables = {
				remove: 1,
			  swap: 1,
			  peek: 1
			}

	  , userCode
	  , opponentCode
	  , opponentText
	  , gameData = {};
	  
	//=============== functions ==================
	
	function trace(text){
		$('#console').prepend('<li>' + text +'</li>');
  }
  
  function getOutput(f, input){
		return f(input);
  }
  
  function generateOutputs(question, userCode){
    var attempt = eval('(' + userCode + ')')
      , outputs = []
      , i ;
      
    // Pass all the required tests
    for(i = 0; i < question.alwaysTest.length; i++){
      outputs.push(getOutput(attempt,question.alwaysTest[i]));        
    }
    return outputs;
  }
  
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

	function checkAnswers(answers, trace){
		var i	
			, allCorrect = true
			, test
			, correct
			, answer;
			
		for(i = 0; i < answers.length; i++){
			test = gameData.question.alwaysTest[i];
		  answer = gameData.question.answers[i];
		  correct = checkAnswer(answer, answers[i]);
		  trace('<div class="'+ (correct ? 'correct' : 'error') + '">' + JSON.stringify(test) + ' -> ' + JSON.stringify(answers[i]) + '</div>');
		  if(!correct){
				allCorrect = false;
		  } 
		}
		if(allCorrect){
			trace('<div class="correct"> PASSED! unit tests</div> ');
		}else{
			trace('<div class="error"> FAILED unit tests</div> ');
		}
		
		return allCorrect;
	}
  
	function compileHandler() {
    var worked = false
			, answers
			, allCorrect;

    try {
      answers = generateOutputs(gameData.question, userCode.getValue());
      allCorrect = checkAnswers(answers, trace);
      if(allCorrect){
				socket.emit('compile', {answers:answers, worked:true});
      }else{	
				socket.emit('compile', {answers:answers, worked:false});
      }
      
    } catch(e) {
      trace(e.name + ': ' + e.message);
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
    if(gameData.user.consumables[ability] < 0) {
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
		var k;
		for(k in store) {
		  container.find('.' + k).find('.count').text(store[k]);
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
		
		updateAbilities(userData.consumables, buttons);
		bindUserInfo(userData, userInfo);
  }
  
 
  
  //================= code ==================
	
  // initializing codemirror hakadoo keyMapping
  $.CodeMirror.keyMap.hackadoo = {
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
      $.console.log('sending text', text);
      socket.emit('textEntered', {
        text: text
      });
    },
    keyMap: 'hackadoo',
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
    if(useAbility(gameData.user.consumables, 'swap', leftButtons.find('.swap'))) {
      socket.emit('swap');
    }
  });

  leftButtons.find('.remove').click(function() {
    if(useAbility(gameData.user.consumables, 'remove', leftButtons.find('.remove'))) {
      socket.emit('remove');
    }
  });

  leftButtons.find('.peek').click(function() {
    if(useAbility(gameData.user.consumables, 'peek', leftButtons.find('.peek'))) {
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

  // socket event handlers

  socket.on('peek', function() {
    useAbility(gameData.opponent.consumables, 'peek', rightButtons.find('.peek'));
  });

  socket.on('swap', function() {
    var text = userCode.getValue().split(''), swap = Math.floor(Math.random() * text.length - 1), holder = text[swap];

    useAbility(gameData.opponent.consumables, 'swap', rightButtons.find('.swap'));
    text[swap] = text[swap + 1];
    text[swap + 1] = holder;
    userCode.setValue(text.join(''));
  });

  socket.on('remove', function() {
    var lines = userCode.getValue().split('\n')
      , killLine = Math.floor(Math.random() * lines.length)
      , newText = lines.filter(function(line, i) {
		      return i !== killLine;
		    }).join('\n');

    useAbility(gameData.opponent.consumables, 'remove', rightButtons.find('.remove'));
    userCode.setValue(newText);
  });

  socket.on('textUpdate', function(data) {
    $.console.log('textUpdate' + data.text);
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
    
    // add the consumable numbers to the user data object    
    gameData.user.consumables = $.extend({}, defaultConsumables);
    gameData.opponent.consumables = $.extend({}, defaultConsumables);
    
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
        trace('Time out. You BOTH lose!');
      }
    }, 1000);

		// setting user profile info
    bindUser(gameData.user, leftContainer);
    bindUser(gameData.opponent, rightContainer);

    // Set up function header
    userCode.setValue('function(s) {\n\n' + '\t// your code here\n\n' + '\treturn s;\n' + '}');
  });

  socket.on('lose', function() {
		$.fancybox('<h1>You Lose!</h1>');
    trace('You lose!');
  });
  
  // if they cheat lets get their help in making hackadoo better!
  socket.on('cheating', function(data){
		$.fancybox(data.msg);
  });
  
  // response from user event
  socket.on('user:compile', function(data){
		if(data.worked){
			$.fancybox('<h1>You Win!</h1>');
			trace('You Win!');
		}else{
			trace('<div class="error">FAILED Server Side unit tests </div>');
		}
  });
  
  socket.on('opponent:compile', function(data){
		checkAnswers(data.answers, function(text){
			$('#opponent_console').prepend('<li>' + text + '</li>');
		});
  });
});
