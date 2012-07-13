$(document).ready(function() {'use strict';
  
  // Connect to socket.io
  var socket = io.connect(window.Array.host);

  $('#general').click(function() {
    socket.emit('joinGeneralPool');
  });

  $('#challenge').click(function() {
     socket.emit('joinGeneralPool');   
  });

  socket.on('error', function() {
    console.log('got an error');
  });

  socket.on('battle', function() {
    window.location = '/battle';
  });
});
