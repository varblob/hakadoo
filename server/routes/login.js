/*
 * login.js
 *
 * This file contains the routes for logging in via Twitter. Namely, it 
 * contains a route for initializing the OAuth handshake and a route for the 
 * OAuth callback.
 */

var config = require('flatiron').app.config
  , querystring = require('querystring')
  , http = require('http')
  , async = require('async')
  , OAuth = require('oauth').OAuth

  // Twitter OAuth callback URL
  , callback = config.get('twitterCallback')

  // Twitter OAuth object
  , oa = new OAuth(
      'https://api.twitter.com/oauth/request_token'
    , 'https://api.twitter.com/oauth/access_token'
    , config.get('twitterToken')
    , config.get('twitterSecret')
    , '1.0'
    , callback
    , 'HMAC-SHA1'
  );

/*
 * Initiate the OAuth handshake
 */
exports.initiate = function() {
  var self = this;

  console.log(callback, config.get('twitterToken'), config.get('twitterSecret'))

  oa.getOAuthRequestToken(
    function(err, oauth_token, oauth_token_secret, results) {
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

/*
 * Complete the OAuth handshake and retrieve the needed user profile information
 */
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
    var screenName = results.screen_name
      , profileImage;

    if (err) {
      return self.error();
    }

    oauth.access_token = oauth_access_token;
    oauth.access_token_secret = oauth_access_token_secret;

    // Now that the user has authenticated, query twitter for the username,
    // profile picture, and profile URL
    profileImage = {
      host: 'api.twitter.com'
    , port: 80
    , path: '/1/users/profile_image?' + querystring.stringify({
        screen_name: screenName
      , size: 'bigger'
      })
    };

    // Once the response is received, store the data in the session and 
    // redirect to the battle page
    http.get(profileImage, function(res) {
      session.avatar = res.headers.location;
      session.name = screenName;
      self.redirect('/battle');
    });
  });
};
