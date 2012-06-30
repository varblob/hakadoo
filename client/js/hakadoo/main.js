$(document).ready(function() {
		'use strict';
	// Connect to socket.io
	
	var questionIndex = 1,
		question = $.hakadoo.questions[questionIndex],
		socket = io.connect(window.Array.host),
		you,
		them = CodeMirror.fromTextArea(document.getElementById("compete_code"), {
			lineNumbers: true,
			matchBrackets: true
		}),
		compileHandler = function(){
			console.log('compile');
	    	try{
	    		$.hakadoo.validate(questionIndex, you.getValue());
	    	}catch(e){
	    		$('#console').append('<li>' + e.message + '</li>');
	    	}
		};
		
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
	
	// socket.on('you:textUpdate', function(data) {
		// console.log('other:textUpdate' + data.text);
		// you.setValue(data.text);
	// });
	
	// if(e.type === 'keydown' && e.charCode === 13 && e.ctrlKey){
					// compileHandler();
				// } 
	
	socket.on('textUpdate', function(data) {
		console.log('textUpdate' + data.text);
		them.setValue(data.text);
	});
	
	socket.on('waiting', function(data){
		console.log('waiting');
	});
	
	socket.on('ready', function(data){
		console.log('ready');
	});
	
	$('#challenge_text').text(question.question);
	
	
	$('#compile_button').click(function(){
    	compileHandler();
    });
    // Disable Cut, Copy and Paste in the Code Mirror
    $(".CodeMirror*").live("cut copy paste", function(e) {
        e.preventDefault();
    });
});
