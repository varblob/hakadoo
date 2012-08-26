;(function() {'use strict';

  // IDs of online users displayed on the page
  var onlineUsers = {};

  $(document).ready(function() {

    /*
     * Templating
     */
    var $onlineUserList = $('#users-online');
    var $firstUser = $onlineUserList.find('li:first-child');
    var $onlineUserSkeleton = $firstUser.detach();
    var $onlineUserHeading = $('#online-count');
    var $battleWait = $('#battle-wait');
    $onlineUserList.children().remove();

    // Connect to socket.io
    var socket = io.connect(window.Array.host);

    /*
     * Element bindings
     */
    $('#battle-random').click(function() {
      socket.emit('joinWaitingPool');
      $battleWait.show();
    });

    $('#challenge').click(function() {
      socket.emit('postChallenge', { 
        opponentName: $('#opponent-name').val()
      });
      $battleWait.show();
    });


    /*
     * Socket.io listeners
     */
    socket.on('profile', function(user) {
      $('#welcome').html('Welcome, ' + user.name);
      $('#bubble').css('background-image', 'url("' + user.avatar + '")');
      $('.profile-link').attr('href', '/u/' + user.name);
    });

    socket.on('error', function() {
      console.log('got an error');
    });

    socket.on('startBattle', function() {
      window.location = '/battle';
    });

    socket.on('userLoggedIn', function(data) {
      var user = data.user;

      // Don't display duplicate users
      if (onlineUsers[user._id]) return;

      onlineUsers[user._id] = user; 
      var $userEntry = $onlineUserSkeleton.clone();
      $userEntry.attr('data-id', user._id);

      // Link to user profile
      $userEntry
        .find('a')
        .attr('href', '/u/' + user.name)
        ;

      // Display twitter handle
      $userEntry
        .find('.online-username')
        .html(user.name)
        ;

      // Display number of battles
      $userEntry
        .find('.online-battles')
        .html(user.battles + ' battles')
        ;

      // Display user avatar
      $userEntry
        .find('.online-avatar')
        .css('background-image', 'url("' + user.avatar + '")')
        ; 

      $onlineUserList.append($userEntry);
      $onlineUserHeading.html(Object.keys(onlineUsers).length
         + ' users online');
    });

    socket.on('userLoggedOut', function(data) {
      $onlineUserList
        .find('[data-id="' + data.userID + '"]')
        .remove()
        ;
    });
  });
})();
