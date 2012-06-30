var socketIO = require('socket.io')
  , flatiron = require('flatiron')
  , app = flatiron.app;

exports.connections = [];

exports.startListening = function() {

  var io = socketIO.listen(app.server);
  console.log('Listening', app.server);

  io.sockets.on('connection', function (socket) {
  
    

    socket.on('textEntered', function(data) {
      var text = data.text.toUpperCase();
      console.log('go text', text);
      socket.emit('textUpdate', { text: text });
    });
  });
};
