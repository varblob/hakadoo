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
  , connect = require('connect')
  , director = require('director')
  , ecstatic = require('ecstatic')
  , socketIO = require('socket.io')
  , resourceful = require('resourceful-mongo')
  ;

// app.config
setupConfiguration();

// Loading any local modules only after nconf has been set up.
var hu = require('./server/util/http')
  , middleware = require('./server/util/middleware')
  , error = require('./server/util/error')
  , paths = require('./server/paths')
  ;

// app.http
setupMiddleware();

// app.router
setupRouting();

// Start the database
resourceful.use('mongodb', {
  uri: config.get('mongoURI')
, onConnect: function(err) {
    if (err) throw err;

    // Start the web server
    app.start(config.get('port'));

    // Start socket.io listening
    setupSocketIO();

    // Everything started up fine
    console.log('OK!'); 
  }
});


/*
 * Set up the nconf config object
 */
function setupConfiguration() {
  var env;

  config
    .argv()
    .env()
    ;
  env = config.get('NODE_ENV') || 'local';
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
function setupMiddleware() {
  app.store = new require('connect/lib/middleware/session/memory');
  app.use(flatiron.plugins.http);
  app.http.before = [
    connect.cookieParser('secret')
  , connect.cookieSession({
      cookie: { 
        domain: 'localhost' 
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
function setupRouting() {

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
function setupSocketIO() {

  // Start listening
  var io = socketIO.listen(app.server);

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
    (paths.sockets[path] || function() {}).call({
      e: error
    , socket: socket
    }, socket);
  });
}
