$(document).ready(function() {
	'use strict';

	var questionIndex = 1,
		question = $.hakadoo.questions[questionIndex],

		// Connect to socket.io
		socket = io.connect(window.Array.host),
		them = CodeMirror.fromTextArea(document.getElementById("opponent_code"), {
			lineNumbers: true,
			matchBrackets: true
		}),
		abilities = {
			remove: 3,
			swap: 4,
			peek: 5
		},
		opponentAbilities = {
			remove: 3,
			swap: 4,
			peek: 5
		},
		you, 
		opponentText,
		
		compileHandler = function(){
			var worked = false;
			console.log('compile');
			
			try {
				worked = $.hakadoo.validate(questionIndex, you.getValue());
				$('#console').append('<li>Congratulations! You win!</li>');
			} catch(e) {
        worked = false;
				$('#console').append('<li>' + e.message + '</li>');
			}
			socket.emit('compile', {worked: worked});
		},
		
		censor = function(text) {
			return text.replace(/\w/g, '01');
	    },
	    
	    setAbility = function(store, ability, val, button){
			store[ability] = val;
			if(abilities[ability] < 0){
				button.toggleClass('disabled', true);
			}else{
				button.toggleClass('disabled', false);
			}
			button.find('.count').text(val > 0 ? val : 0);
			return val;
	    },
	    
	    useAbility = function(store, ability, button){
			return setAbility(store, ability, store[ability] - 1, button) >= 0;
	    },
	    
	    updateAbilities = function(store, container){
			for(var k in store){
	    		container.find('.' + k).find('.count').text(store[k]);
	    	}
	    };
	
  // Read the profile data for this user
  var user = $.parseJSON($('#page-data').html());
  socket.emit('introduction', user);

	//initing the ability counts    
	updateAbilities(abilities, $('#left_buttons'));
	updateAbilities(opponentAbilities, $('#right_buttons'));
		
	CodeMirror.keyMap.hakadoo = {
		'Ctrl-Enter': function(cm){
			compileHandler();
		},
		'fallthrough': ['basic']
	}; 
	
	you = CodeMirror.fromTextArea(document.getElementById("user_code"), {
		lineNumbers: true,
		matchBrackets: true,
		onChange: function(e) {
			var text = you.getValue();
			console.log('sending text', text);
			socket.emit('textEntered', {text: text});
		},
		keyMap: 'hakadoo'
	});
	
	$('#challenge_text').text(question.question);
	
	$('#compile_button').click(function(){
		compileHandler();
    });
    
    $('#left_buttons').find('.swap').click(function() {
		if(useAbility(abilities, 'swap', $('#left_buttons').find('.swap'))){
			socket.emit('swap');	
		}
    });

    $('#left_buttons').find('.remove').click(function() {
		if(useAbility(abilities, 'remove', $('#left_buttons').find('.remove'))){
			socket.emit('remove'); 
		}
    });
    
	$('#left_buttons').find('.peek').click(function() {
		if(useAbility(abilities, 'peek', $('#left_buttons').find('.peek'))){
			them.setValue(opponentText);
			setTimeout(function() {
				them.setValue(censor(opponentText));
			}, 1500);
			socket.emit('peek');
		}
    });
    
     // Disable Cut, Copy and Paste in the Code Mirror
    // $(".CodeMirror*").live("cut copy paste", function(e) {
        // e.preventDefault();
    // });
    
// socket event handlers

	socket.on('peek', function(){
		useAbility(opponentAbilities, 'peek', $('#right_buttons').find('.peek'));
	});

    socket.on('swap', function() {
		var text = you.getValue().split(''),
			swap = ~~(Math.random() * text.length - 1),
			holder = text[swap];
		
		useAbility(opponentAbilities, 'swap', $('#right_buttons').find('.swap'));
		text[swap] = text[swap + 1]
		text[swap + 1] = holder;
		you.setValue(text.join(''));
    });

    
    socket.on('remove', function() {
		var lines = you.getValue().split('\n'),
			killLine = ~~(Math.random() * lines.length),
			newText = lines.filter(function(line, i) {
				return i !== killLine;
			}).join('\n');
			
		useAbility(opponentAbilities, 'remove', $('#right_buttons').find('.remove'));	
		you.setValue(newText);
    });
	
	socket.on('textUpdate', function(data) {
		console.log('textUpdate' + data.text);
		opponentText = data.text;
		them.setValue(censor(data.text));
	});
	
	socket.on('waiting', function(data){
		console.log('waiting');
	});
	
	socket.on('ready', function(data){
    var opponent = data.opponent;
    var templateUserBox = function(user, $box) {
      console.log(user.avatar);
      $box.find('.avatar').css('background-image', "url('" + user.avatar + "')");
      $box.find('.username').text(user.name);
      $box.find('.username').attr('href', 'http://twitter.com/' + user.name);
    };

    templateUserBox(user, $('#self'));
    templateUserBox(opponent, $('#opponent'));

		you.setValue('function(s) {\n\n' + '\t// your code here\n\n' + '\treturn s;\n' + '}');
	});
	
	socket.on('lose', function() {
    $('#console').append('<li>You lose!</li>');
	});   
});
