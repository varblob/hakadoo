var login = require('./routes/login')
  , battle = require('./sockets/battle')
  , lobby = require('./sockets/lobby');

// HTTP response handlers 
exports.routes = {
  '/login': { get: login.initiate }
, '/callback': { get: login.callback }
, '/logout': { get: login.logout }
//, '/u/:twitterHandle': { get: undefined }
};

// Socket.io listeners
exports.sockets = {
  '/battle': battle
, '/lobby': lobby
};
