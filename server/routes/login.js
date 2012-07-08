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
  , Users = require('../models/users')

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
      , twitterID = results.user_id
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
      var avatar = res.headers.location;

      // Check if this user is new or returning
      Users.get({twitterID: twitterID}, function(err, user) {
        if (err) return self.error();

        // Function called at end of both new user and returning user codepaths
        var proceed = function(err, user) { 
          if (err) return self.error();
         
          console.log('--*', user);

          session.userID = user._id;
          self.redirect('/battle');
        };

        // Returning user
        if (user._id) {

          console.log('returning user!', user);

          // Account for changes to the user's screen name or avatar
          user.avatar = avatar;
          user.name = screenName;
          user.save(function(err) {
            proceed(err, user);
          });

        // New user
        } else {

          console.log('new user!')

          Users.create({
            name: screenName
          , avatar: avatar
          , twitterID: twitterID

          }, proceed);
        }
      });
    });
  });
};


/*
 * Destroys a user's session data, thus logging him out
 */
exports.logout = function() {
  var session = this.req.session;
  delete session.auth;
  delete session.userID;
  this.redirect('/');
};
