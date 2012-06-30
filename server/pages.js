var fs = require('fs')
  , querystring = require('querystring')
  , http = require('http')
  , async = require('async')
  , OAuth = require('oauth').OAuth;

// Battle test page
exports.battle = function() {
  this.res.writeHead(200, {'Content-Type': 'text/html'});
  this.res.end(exports.pages['battle.html']);
}

var callback = 'http://localhost:8888/callback';

// Twitter OAuth
var oa = new OAuth(
  'https://api.twitter.com/oauth/request_token'
, 'https://api.twitter.com/oauth/access_token'
, '3G4VsglLmRDniG3E5gCiRQ'
, 'BYtLfaGNIGs14adzYvFX9GmmRG9Wgyz2tI8Xw4ZqSsM'
, '1.0'
, callback
, 'HMAC-SHA1'
);

// Initiate the OAuth handshake
exports.login = function() {
  var self = this;
 
  oa.getOAuthRequestToken(function(err, oauth_token, oauth_token_secret, results) { 
    if (err) {
      console.log(err);
      return self.res.end('Authorization failed.');
    }

    var session = self.req.session;

    session.oauth  = {
      token: oauth_token
    , token_secret: oauth_token_secret
    };

    var redirTo = 'https://twitter.com/oauth/authenticate?' + querystring.stringify({
      oauth_token: oauth_token
    , oauth_callback: callback
    });  

    self.res.writeHead(302, {'Location': redirTo});
    self.req.connection = {encrypted: false};
    self.res.emit('header');
    self.res.end();
  });
};

// Complete the OAuth handshake
exports.callback = function() {
  var self = this;
  var session = this.req.session;

  if (!session.oauth) {
    return self.res.end('Authorization failed.');
  }

  var oauth = session.oauth;
  oauth.verifier = self.req.query.oauth_verifier;

  oa.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier, 
    function(err, oauth_access_token, oauth_access_token_secret, results) {

    if (err) {
      console.log(err);
      return self.res.end('Authorization failed.');
    }

    var screen_name = results.screen_name;

    oauth.access_token = oauth_access_token;
    oauth.access_token_secret = oauth_access_token_secret;

    // Now that the user has authenticated, query twitter for the username,
    // profile picture, and profile URL
    var profileImage = {
      host: 'api.twitter.com'
    , port: 80
    , path: '/1/users/profile_image?' + querystring.stringify({
        screen_name: screen_name
      , size: 'bigger'
      })
    };

    http.get(profileImage, function(res) {
      var avatar = res.headers.location;

      self.res.writeHead(200, {'Content-Type': 'text/html'});

      var battleHTML = exports.pages['battle.html'];
      battleHTML = battleHTML.replace('{{JSON}}', JSON.stringify({
        name: screen_name
      , avatar: avatar
      }));

      self.res.end(battleHTML);
    });
  });
};

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
