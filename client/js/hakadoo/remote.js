$.hakadoo = $.hakadoo || {};
$.hakadoo.remote = function(){
	'use strict';
	// Connect to socket.io
	var socket = io.connect(window.Array.host);
	
	$('#you').bind('change keyup', function() {
		var text = $('#you').val();
		console.log('sending text', text);
		socket.emit('textEntered', {text: text});
	});
	
	socket.on('you:textUpdate', function(data) {
		$('#opponent').text(data.text);
	});
	  
	socket.on('other:textUpdate', function(data) {
		$('#opponent').text(data.text);
	});
	
};
