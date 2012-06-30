var fs = require('fs')
  , async = require('async');

exports.battle = function() {

  

  this.res.writeHead(200, {'Content-Type': 'text/html'});
  this.res.end(exports.pages['battle.html']);
}

/*
 * Returns a mapping of filename to HTML contents for all files in a given path
 * @param (String) path
 * @callback (Object) 
 */
exports.getHTMLFiles = function(path, cb) {
 
  fs.readdir(path, function(err, files) {
    if (err) return cb(err);

    var entries = {};

    async.parallel(files.map(function(file) {
      return function(cb) {
        fs.readFile(path + '/' + file, 'utf8', cb)
      };

    }), function(err, contents) {
      if (err) return cb(err);

      exports.pages = {};

      files.forEach(function(file, i) {
        exports.pages[file] = contents[i];
      });

      return cb(null, exports.pages);
    });
  });
}
