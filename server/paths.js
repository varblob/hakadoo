var login = require('./routes/login')
  , battle = require('./sockets/battle');

// HTTP response handlers 
exports.routes = {
  '/login': { get: login.initiate }
, '/callback': { get: login.callback }
, '/logout': { get: login.logout }
};

// Socket.io listeners
exports.sockets = {
  '/battle': battle
}
