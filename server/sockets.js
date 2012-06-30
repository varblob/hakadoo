var socketIO = require('socket.io')
  , flatiron = require('flatiron')
  , app = flatiron.app;

// The socket connection waiting for a partner
exports.single = null;

exports.startListening = function() {

  var io = socketIO.listen(app.server);
  console.log('Listening', app.server);

  io.sockets.on('connection', function (socket) { 
    console.log('connection from', socket);

    // A partner is already waiting
    if (exports.single) {
      var partner = exports.single;
      var players = [socket, partner];
      exports.single = null;
  
      // Battle logic...
      bindBattleLogic(players);
  
    // Otherwise, this is an odd connection. Wait for a partner
    } else {
      exports.single = socket;
      socket.emit('waiting');
    }
  });
};


/*
 * Binds the event for handling battle mechanics
 * @param (Array) players
 */ 
function bindBattleLogic(players) {

  players.forEach(function(me, i) {
    var opponent = players[i^1];

    me.emit('ready', {});

    me.on('textEntered', function(data) {
      var text = data.text.toUpperCase();
      console.log('go text', text);
      opponent.emit('textUpdate', { text: text });
    });
  });
}
