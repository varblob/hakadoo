var socketIO = require('socket.io')
  , connect = require('connect')
  , flatiron = require('flatiron')
  , app = flatiron.app;

// The socket connection waiting for a partner
exports.single = null;

exports.startListening = function() {

  var io = socketIO.listen(app.server);

  io.configure(function() {
    io.set('authorization', function(data, cb) {
      var cookies = connect.utils.parseCookie(data.headers.cookie) 
      data.auth = JSON.parse(cookies['connect.sess'].match(/\{.*\}/g)[0]);
      cb(null, true);
    });
  });

  io.on('connection', function(socket, session) {

    console.log(socket.handshake.auth);

    socket.on('introduction', function(user) {
      var partner, players;

      socket.hakadoo = user;

      // A partner is already waiting
      if (exports.single) {
        partner = exports.single;
        players = [socket, partner];
        exports.single = null;
    
        // Battle logic...
        bindBattleLogic(players);
    
      // Otherwise, this is an odd connection. Wait for a partner
      } else {
        exports.single = socket;
        socket.emit('waiting');
      }
    });
  });
};


/*
 * Binds the event for handling battle mechanics
 * @param (Array) players
 */ 
function bindBattleLogic(players) {

  players.forEach(function(me, i) {
    var opponent = players[i^1];

    me.emit('ready', {opponent: opponent.hakadoo});

    // When a player enters text, inform the opponent
    me.on('textEntered', function(data) {
      var text = data.text;
      opponent.emit('textUpdate', { text: text });
    });

    // For the battle actions, simply relay the command from player to player
    me.on('remove', function() {
      opponent.emit('remove', {});
    });

    me.on('swap', function() {
      opponent.emit('swap', {});
    });

    me.on('compile', function(data) {
      if (data.worked) {
        opponent.emit('lose', {})
      }
    });

    me.on('peek', function() {
      opponent.emit('peek', {});
    });
  });
}
