var flatiron = require('flatiron')
  , app = flatiron.app
  , config = app.config
  , connect = require('connect')
  , resourceful = require('resourceful-mongo')
  , director = require('director')
  , ecstatic = require('ecstatic')
  ;

// Configuration
config
  .argv()
  .env()
  ;

var env = config.get('NODE_ENV') || 'local';

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

// Require local module only after the config options have been set
var io = require('./server/sockets')
  , hu = require('./server/util/http')
  , middleware = require('./server/util/middleware')
  , routes = require('./server/rest');

// Middleware
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

// MongoDB
resourceful.use('mongodb', {
  uri: 'mongodb://localhost/hackadoo'
, onConnect: function() {

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

    // Start the app
    app.start(8888);

    // Start socket.io
    io.startListening();

    // Everything started up fine
    console.log('OK!');
  }
});
