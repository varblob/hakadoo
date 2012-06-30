$(document).ready(function() {

  // Read the profile data for this user
  var user = $.parseJSON($('#page-data').html());

  // Connect to socket.io
  var socket = io.connect('http://' + window.location.host, user);
  socket.emit('introduction', user);

  // Get either 'waiting' or 'ready'
  socket.on('waiting', function() {
    $('#status').text('Waiting...');
  });

  socket.on('ready', function(data) {
    $('#status').text('Go!');   
    var otherUser = data.opponent;
    console.log(user, otherUser);

    var $you = $('#you')
      , $opponent = $('#opponent')
      , opponentText = '';

    // Update the opponent with this user's current text
    function sendTextUpdate() {
      var text = $you.val();
      socket.emit('textEntered', {text: text});
    }

    // Replace non-whitespace characters with blocks
    function censor(text) {
      return text.replace(/\w/g, '&#x258A;');
    };

    // Bind the battle events
    $you.bind('change keyup', sendTextUpdate);

    socket.on('textUpdate', function(data) {
      opponentText = data.text;
      $opponent.html(censor(data.text));
    });

    socket.on('remove', function() {
      var lines = $you.val().split('\n');
      var killLine = ~~(Math.random() * lines.length);
      var newText = lines.filter(function(line, i) {
        return i !== killLine;
      }).join('\n');
      $you.val(newText);
      sendTextUpdate();
    });

    socket.on('swap', function() {
      var text = $you.val().split('');
      var swap = ~~(Math.random() * text.length - 1);
      var holder = text[swap];
      text[swap] = text[swap + 1]
      text[swap + 1] = holder;
      $you.val(text.join(''));
      sendTextUpdate();
    });

    $('#swap').click(function() {
      socket.emit('swap');
    });

    $('#remove').click(function() {
      socket.emit('remove');
    });

    $('#peek').click(function() {
      $opponent.text(opponentText);
      setTimeout(function() {
        $opponent.html(censor(opponentText));
      }, 1000);
    });
  });
});
