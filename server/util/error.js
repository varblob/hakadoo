/*
 * error.js
 *
 * This exports a single function which  automagically handles callback errors
 * in top-level route and socket code. Instead of writing...
 *   asyncFunction(param, function(err, value) {
 *     if (err) {
 *       // close out connection, log error, etc.
 *     }
 *
 * ...simply write
 *   asyncFunction(param, this.e(function(value) {
 *
 * `this.e` partially evaluates the callback into a new function which performs
 * an error handling routine in the case of an error, and otherwise executes 
 * the provided function. It also keeps callbacks executing in the same 
 * context, thus sidestepping the need for `var self = this`.
 */

module.exports = function(cb) {

  return function(err) {
    if (err) {

      // An error making a response
      if (this.req) {
        this.error();

      // An error in a socket.io callback
      } else if (this.socket) {
        this.socket.emit('error')
        this.socket.disconnect();
      }

      // For now, we'll just print the error to stderr
      console.error(err);

    } else {
      var args = Array.prototype.slice.call(arguments, 1);
      cb.apply(this, args);
    }
  }.bind(this);
};
