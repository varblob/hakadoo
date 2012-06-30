var pages = require('./pages');

module.exports = {
  '/' : { get: pages.index }
, '/anotherPage': { get: pages.anotherPage }
};
