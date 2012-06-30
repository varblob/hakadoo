$(document).ready(function() {

  // Connect to socket.io
  var socket = io.connect('http://localhost');

  $('#you').bind('change keyup', function() {
    var text = $('#you').val();
    console.log('sending text', text);
    socket.emit('textEntered', {text: text});
  });

  socket.on('textUpdate', function(data) {
    $('#opponent').text(data.text);
  });
});
