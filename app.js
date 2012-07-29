/*
 * app.js
 *
 * Entry point for the application's execution. Sets up the database, the web 
 * server, and the socket.io listener
 */

var flatiron = require('flatiron')
  , app = flatiron.app
  , config = app.config
  , url = require('url')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  , connect = require('connect')
  , director = require('director')
  , ecstatic = require('ecstatic')
  , socketIO = require('socket.io')
  , mongoose = require('mongoose')
  , redis = require('redis')
  ;

// app.config
setUpConfiguration();

// Loading any local modules only after nconf has been set up.
var hu = require('./server/util/http')
  , middleware = require('./server/util/middleware')
  , error = require('./server/util/error')
  , paths = require('./server/paths')
  ;

// app.http
setUpMiddleware();

// app.router
setUpRouting();

// Connect to MongoDB
mongoose.connect(config.get('mongoURI'));

// Connect to Redis
setUpRedis();

// Start the web server
app.start(config.get('port'));

// Start socket.io listening
setUpSocketIO();

// Everything started up fine
console.log('OK!'); 


/*
 * Set up the nconf config object
 */
function setUpConfiguration() {
  var env;

  config
    .argv()
    .env()
    ;
  env = config.get('NODE_ENV') || 'production';
  config
    .file({ 
      file: './config/config.json' 
    })
    .add('env', {
      type: 'file'
    , file: './config/environments/' + env + '.json' 
    })
    .set('root', __dirname + '/server')
    ;
}


/*
 * Set up the app's HTTP middleware stack
 */
function setUpMiddleware() {
  app.store = new require('connect/lib/middleware/session/memory');
  app.use(flatiron.plugins.http);
  app.http.before = [
    connect.cookieParser('secret')
  , connect.cookieSession({
      cookie: { 
        domain: config.get('domain')
      , store: app.store
      }
    })
  , middleware.pageRewrite
  , ecstatic(__dirname + '/client')
  ];
}


/*
 * Configure the app's router and load the routing table
 */
function setUpRouting() {

  // Set up routing table
  app.router.mount(paths.routes);
  app.router.configure({ 
    recurse: false
  , strict: false
  , async: true
  });

  // Attach HTTP utilities to route context
  app.router.attach(function() {
    var self = this;
    Object.keys(hu).forEach(function(name) {
      self[name] = hu[name];
    });
  });
}


/*
 * Start listening for socket.io connections
 */
function setUpSocketIO() {

  // Start listening
  var io = socketIO.listen(app.server);

  // An evented interface on top of redis pub/sub to allow easy communication 
  // with the socket to which a given user is connected
  var subEventer = function() {
    EventEmitter.call(this);
  };

  util.inherits(subEventer, EventEmitter);

  // Set up a global channel for broadcasting messages to all users on the site
  app.messages['global'] = new subEventer();
  app.pubsub.subscribe('global');

  // Connect user sessions and sockets.io clients. This attaches the session 
  // object to the socket.io handshake object
  io.configure(function() {
    io.set('authorization', function(data, cb) {
      var cookies = connect.utils.parseCookie(data.headers.cookie);
      data.session = JSON.parse(cookies['connect.sess'].match(/\{.*\}/g)[0]);
      data.path = url.parse(data.headers.referer).pathname; 
      cb(null, true);
    });
  });

  // Upon a new connection, bind the appropriate client listeners for the URL
  // from which the socket.io connection was initialized.
  io.on('connection', function(socket) {
    var path = socket.handshake.path;
    var userID = socket.handshake.session.userID;

    // Open a listening channel for this user
    app.messages[userID] = new subEventer();
    app.pubsub.subscribe(userID);

    // Upon disconnect, close the user's channel
    socket.on('disconnect', function() {
      app.pubsub.unsubscribe(userID);
    });

    (paths.sockets[path] || function() {}).call({
      e: error
    , socket: socket
    }, socket);
  });
}


/*
 * Opens two Redis clients. One is exposed to the rest of the app through
 * `app.store` and is used for queries/updates. The other is used to subscribe
 * to redis changes, and can be listened via `app.messages`. 
 */
function setUpRedis() {
  var redisURI = url.parse(config.get('redisURI'));
  app.store = redis.createClient(redisURI.port, redisURI.hostname);
  app.pubsub = redis.createClient(redisURI.port, redisURI.hostname);

  // When the pubsub client recieves a message, send an event through the 
  // appropriate `app.messages` eventer
  app.pubsub.on('message', function(channel, message) {
    var messageObject = JSON.parse(message)
      , eventName = messageObject.event;
    delete messageObject.event;
    app.messages[channel].emit(eventName, messageObject);
  });

  // Expose a function for easily sending messages
  app.messages = function(toUser, eventName, data) {
    data = data || {};
    data.event = eventName;
    app.store.publish(toUser, JSON.stringify(data || {}));
  };
};
