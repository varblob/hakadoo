var flatiron = require('flatiron')
  , app = flatiron.app
  , path = require('path')
  , connect = require('connect')
  , resourceful = require('resourceful-mongo')
  , async = require('async')
  , director = require('director')
  , routes = require('./server/routingTable')
  , pages = require('./server/pages')
  , ecstatic = require('ecstatic')
  //  , io = require('./server/socket.io')
  ;

// Middleware stack
app.use(flatiron.plugins.http);
app.http.before = [
  connect.cookieParser('secret'),
  connect.cookieSession({
    cookie: { domain: 'localhost' }
  }),
 ecstatic(__dirname + '/client')
];

// MongoDB
resourceful.use('mongodb', {
  uri: 'mongodb://localhost/hakadoo'
, onConnect: function() {

    // Start socket.io
    // io.startListening();

    // Set up routing table
    app.router.mount(routes);
    app.router.configure({ 
      recurse: false
    , strict: false
    , async: true
    });
 
    // Read static files to memory
    pages.getHTMLFiles('./client/html', function(err, contents) {

      // Start the app
      app.start(8888);
      console.log('OK!');
    });
  }
});
