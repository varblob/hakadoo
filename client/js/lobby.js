$(document).ready(function() {'use strict';
  
  // Connect to socket.io
  var socket = io.connect(window.Array.host);

  $('#waiting').click(function() {
    socket.emit('joinWaitingPool');
  });

  $('#challenge').click(function() {
     console.log($('#opponent-name').val()) 
    socket.emit('postChallenge', { 
      opponentName: $('#opponent-name').val()
    });
  });

  socket.on('error', function() {
    console.log('got an error');
  });

  socket.on('startBattle', function() {
    window.location = '/battle';
  });

  socket.on('profile', function(user) {
    console.log('got profile information', user);
  });

  socket.on('userLoggedIn', function(data) {
    var user = data.user;
    var $userEntry = $('<li><a href="#"></a></li>');
    $userEntry.attr('data-id', user._id);
    $userEntry.find('a')
      .html(user.name)
      .attr('href', 'http://twitter.com/' + user.name)
      ;
    $('#users-online').append($userEntry);
  });

  socket.on('userLoggedOut', function(data) {
    $('#users-online').find('[data-id="' + data.userID + '"]')
      .remove();
  });
});
