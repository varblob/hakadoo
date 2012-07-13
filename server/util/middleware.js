/* 
 * middleware.js
 *
 * This file contains any custom functions that are to be inserted into the 
 * middleware stack.
 */
var routes = require('../paths').routes
  , indexPage = '/html/index.html'
  , loginPage = '/html/index.html'
  ;

/*
 * Rewrites any request URL which lacks an extension to the /html subdirectory.
 * This makes it possible to access pages via /page rather than /html/page.html.
 */
exports.pageRewrite = function(req, res, next) {
  var url, ext, firstDir;

  url = req.url;

  // Strip dangling /
  if (1 + url.lastIndexOf('/') === url.length) {
    url = url.slice(0, url.length - 1)
  }

  // Send root requests to the index page
  if (!url) {
    req.url = indexPage; 
    return next();
  }

  // Check the extension; prepend the /html folder if appropriate
  ext = url.substring(~(~url.lastIndexOf('.') || ~url.length) + 1);
  firstDir = /(\/.*?)(\/|$|\?)/.exec(url)[1]; 

  if (!ext && !~Object.keys(routes).indexOf(firstDir)) {
    req.url = '/html' + url + '.html';
  }

  next();
}

/*
 * If the requested page requires the user to be logged in but the user is not
 * logged in, redirect him to the main page.
 *
exports.loginCheck = function(req, res, next) {
  var url, oauth;

  // Login requirements are given by root directory
  url = req.url;
  oauth = req.session.oauth;

  if (!oauth && config.get('loginPages').some(function(page) {
    return !req.url.indexOf(page);
  })) {
    req.url = loginPage;
  }

  next();
}
*/
