$(document).ready(function() {

  // Connect to socket.io
  var socket = io.connect('http://' + window.location.host);

  // Get either 'waiting' or 'ready'
  socket.on('waiting', function() {
    $('#status').text('Waiting...');
  });

  socket.on('ready', function() {
    $('#status').text('Go!');   

    // Bind the battle events
    $('#you').bind('change keyup', function() {
      var text = $('#you').val();
      console.log('sending text', text);
      socket.emit('textEntered', {text: text});
    });

    socket.on('textUpdate', function(data) {
      $('#opponent').text(data.text);
    });
  });
});
