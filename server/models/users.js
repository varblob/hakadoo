var resourceful = require('resourceful-mongo')
  , config = require('flatiron').app.config
  ;

var Users = module.exports = resourceful.define('users', function() {
  this.use('mongodb', {
    uri: config.get('mongoURI')
  , collection: 'users'
  , safe: true
  });

  // Keep track of user signup date
  this.timestamps()

  // Basic Twitter information
  this.string('name');
  this.string('avatar');
  this.string('twitterID');
});
