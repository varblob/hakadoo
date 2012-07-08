var resourceful = require('resourceful-mongo')
  , config = require('flatiron').app.config
  ;

var People = module.exports = resourceful.define('people', function () {
  this.use('mongodb', {
    uri: config.get('mongoURI')
  , collection: 'people'
  });

  // Keep track of user signup date
  this.timestamps()

  // Basic Twitter information
  this.string('name');
  this.string('avatar');
});
