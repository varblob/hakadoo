exports.index = function() {
  this.res.writeHead(200, {'Content-Type': 'text/html'});
  this.res.end('<strong>this is the index page</strong>');
}

exports.anotherPage = function() {
  this.res.writeHead(200, {'Content-Type': 'text/html'});
  this.res.end('<strong>this is another page</strong>');
}
