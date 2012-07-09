var login = require('./routes/login');

module.exports = {
  '/login': { get: login.initiate }
, '/callback': { get: login.callback }
, '/logout': { get: login.logout }
};
