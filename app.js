var flatiron = require('flatiron')
  , app = flatiron.app
  , connect = require('connect')
  , resourceful = require('resourceful-mongo')
  , director = require('director')
  , routes = require('./server/rest')
  , ecstatic = require('ecstatic')
  , io = require('./server/sockets')
  , hu = require('./server/util/http')
  ;

// Middleware stack
var MemoryStore = require('connect/lib/middleware/session/memory');
app.store = new MemoryStore
app.use(flatiron.plugins.http);
app.http.before = [

  // Prepend the /html/ folder to all requests for .html files.
  function(req, res, next) {
    var url = req.url
      , ext = url.substring(~(~url.lastIndexOf('.') || ~url.length) + 1);
    
    if (ext === 'html') {
      req.url = '/html' + url;
    }

    next();
  }
, connect.cookieParser('secret')
, connect.cookieSession({
    cookie: { 
      domain: 'localhost' 
    , store: app.store
    }
  })
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
