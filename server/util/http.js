/*
 * Send a redirect response for the given address
 * @param (String) address
 */
exports.redirect = function(address) {
  this.res.writeHead(302, {'Location': address});
  this.req.connection = {encrypted: false};
  this.res.emit('header');
  this.res.end();
};


/*
 * Send a generic 500 error to the client and end the response
 */
exports.error = function() {
  this.res.writeHead(500);
  this.res.end();
};
