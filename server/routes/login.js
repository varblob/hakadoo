/*
 * This page contains the routes for logging in via Twitter. Namely, it 
 * contains a route for initializing the OAuth protocol and a route for the 
 * OAuth callback.
 */
var querystring = require('querystring')
  , http = require('http')
  , async = require('async')
  , OAuth = require('oauth').OAuth;

// Twitter OAuth
var callback = 'http://localhost:8888/callback';
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
exports.initiate = function() {
  var self = this;

  oa.getOAuthRequestToken(function(err, oauth_token, oauth_token_secret, results) {
    var redirTo;

    if (err) {
      return self.error();
    }

    self.req.session.oauth = {
      token: oauth_token
    , token_secret: oauth_token_secret
    };

    redirTo = 'https://twitter.com/oauth/authenticate?' + querystring.stringify({
      oauth_token: oauth_token
    , oauth_callback: callback
    , force_login: 'true'
    , screen_name: ''
    });  

    self.redirect(redirTo);
  });
};

// Complete the OAuth handshake
exports.callback = function() {
  var self = this
    , session = self.req.session
    , oauth;

  if (!session.oauth) {
    return self.error();
  }

  oauth = session.oauth;
  oauth.verifier = self.req.query.oauth_verifier;

  oa.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier, 
    function(err, oauth_access_token, oauth_access_token_secret, results) {
    var screenName = results.screen_name;

    // Hack to deal with mysterious OAuth error...
    if (err) {
      return self.error();
    }

    oauth.access_token = oauth_access_token;
    oauth.access_token_secret = oauth_access_token_secret;

    // Now that the user has authenticated, query twitter for the username,
    // profile picture, and profile URL
    var profileImage = {
      host: 'api.twitter.com'
    , port: 80
    , path: '/1/users/profile_image?' + querystring.stringify({
        screen_name: screenName
      , size: 'bigger'
      })
    };

    http.get(profileImage, function(res) {
      session.avatar = res.headers.location;
      session.name = screenName;
      self.redirect('/battle.html');
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
