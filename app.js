/*
 * app.js
 *
 * Entry point for the application's execution. Sets up the databasem the web 
 * server, and the socket.io listener
 */

var flatiron = require('flatiron')
  , app = flatiron.app
  , config = app.config
  , connect = require('connect')
  , resourceful = require('resourceful-mongo')
  , director = require('director')
  , ecstatic = require('ecstatic')
  ;

// app.config
setupConfiguration();

// Loading any local modules only after nconf has been set up.
var io = require('./server/sockets')
  , hu = require('./server/util/http')
  , middleware = require('./server/util/middleware')
  , routes = require('./server/rest');

// app.http
setupMiddleware();

// app.router
setupRouting();

// Start the database
resourceful.use('mongodb', {
  uri: config.get('mongoURI')
, onConnect: function() {

    // Start the web server
    app.start(config.get('port'));

    // Start socket.io
    io.startListening();

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
  app.router.mount(routes);
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
