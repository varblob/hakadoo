var pages = require('./pages');

module.exports = {

  // NOTE: this reloads pages to memory on each request.
  // Helpful for testing but remove on deployment
  before: [function(next) {
    pages.getHTMLFiles('./client/html', function(err) {
      next(err || undefined);
    });
  }]

, '/battle': { get: pages.battle }
};
