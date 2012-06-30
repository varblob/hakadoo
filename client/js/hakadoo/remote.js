
$.hakadoo.remote = function(){
	'use strict';
	// Connect to socket.io
	var socket = io.connect(window.Array.host),
		you = CodeMirror.fromTextArea(document.getElementById("user_code"), {
			lineNumbers: true,
			matchBrackets: true,
			onChange: function(e) {
				var text = you.getValue();
				console.log('sending text', text);
				socket.emit('textEntered', {text: text});
			}
		}),
		them = CodeMirror.fromTextArea(document.getElementById("compete_code"), {
			lineNumbers: true,
			matchBrackets: true
		});
	
	// socket.on('you:textUpdate', function(data) {
		// console.log('other:textUpdate' + data.text);
		// you.setValue(data.text);
	// });
	  
	socket.on('textUpdate', function(data) {
		console.log('textUpdate' + data.text);
		them.setValue(data.text);
	});
	
	socket.on('waiting', function(data){
		console.log('waiting');
	})
	
	socket.on('ready', function(data){
		console.log('ready');
	})
	
};
