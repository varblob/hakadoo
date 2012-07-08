var socketIO = require('socket.io')
  , connect = require('connect')
  , app = require('flatiron').app
  , config = app.config
  , Users = require('./models/user')
  , Questions = require('./models/questions')
  ;

// The socket connection waiting for a partner
exports.single = null;

/*
 * This function is called at server start and binds socket.io events with 
 * the appropriate handling functions.
 */
exports.startListening = function() 
  var io = socketIO.listen(app.server);

  // Connect user sessions and sockets.io clients. This attaches the session 
  // object to the socket.io handshake object
  io.configure(function() {
    io.set('authorization', function(data, cb) {
      var cookies = connect.utils.parseCookie(data.headers.cookie) 
      data.session = JSON.parse(cookies['connect.sess'].match(/\{.*\}/g)[0]);
      cb(null, true);
    });
  });

  // Client-side initialization
  io.on('connection', function(socket) {
    var userID = socket.handshake.session.userID;

    Users.get(userID, function(err, user) {
      if (err) return socket.disconnect();
      var partner;

      socket.user = user;

      // A partner is already waiting
      if (exports.single) {
        partner = exports.single;
        exports.single = null;
    
        // Battle logic...
        bindBattleLogic([socket, partner]);
    
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
  Questions.getRandomQuestion(function(error, question) {
    if (error) return this.error();

    players.forEach(function(me, i) {
      var opponent = players[i^1];

      me.emit('ready', {
      , me: me.user
      , opponent: opponent.user
      , question: question
      });

      // When a player enters text, inform the opponent
      me.on('textEntered', function(data) {
        var text = data.text;
        opponent.emit('textUpdate', { text: text });
      });

      // For the battle actions, simply relay the command from player to player
      me.on('remove', function() {
        opponent.emit('remove');
      });

      me.on('swap', function() {
        opponent.emit('swap');
      });

      me.on('compile', function(data) {
        if (data.worked) {
          opponent.emit('lose');
        }
      });

      me.on('peek', function() {
        opponent.emit('peek');
      });
    });
  });
}
