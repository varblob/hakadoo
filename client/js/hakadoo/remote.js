$.hakadoo = $.hakadoo || {};
$.hakadoo.remote = function(){
	'use strict';
	// Connect to socket.io
	var socket = io.connect(window.Array.host),
		you = CodeMirror.fromTextArea(document.getElementById("user_code"), {
			lineNumbers: true,
			matchBrackets: true
		}),
		them = CodeMirror.fromTextArea(document.getElementById("compete_code"), {
			lineNumbers: true,
			matchBrackets: true
		});
	 
	$('#user_cade').bind('change keyup', function() {
		var text = you.getValue();
		console.log('sending text', text);
		socket.emit('textUpdate', {text: text});
	});
	
	socket.on('you:textUpdate', function(data) {
		you.setValue(data.text);
	});
	  
	socket.on('other:textUpdate', function(data) {
		them.setValue(data.text);
	});
	
	socket.on('waiting', function(data){
		console.log('waiting');
	})
	
	socket.on('ready', function(data){
		console.log('ready');
	})
	
};
