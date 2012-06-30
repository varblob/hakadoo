$(document).ready(function() {

  // Connect to socket.io
  var socket = io.connect('http://' + window.location.host);

  // Get either 'waiting' or 'ready'
  socket.on('waiting', function() {
    $('#status').text('Waiting...');
  });

  socket.on('ready', function() {
    $('#status').text('Go!');   
    
    var $you = $('#you');

    // Bind the battle events
    $you.bind('change keyup', function() {
      var text = $you.val();
      console.log('sending text', text);
      socket.emit('textEntered', {text: text});
    });

    socket.on('textUpdate', function(data) {
      $('#opponent').text(data.text);
    });

    socket.on('removeLine', function() {
      var lines = $you.val().split('\n');
      var killLine = ~~(Math.random() * lines.length);
      var newText = lines.filter(function(line, i) {
        return i !== killLine;
      }).join('\n');
      $you.val(newText);
    });

    socket.on('swapChars', function() {
      var text = $you.val().split('');
      var swap = ~~(Math.random() * text.length - 1);
      var holder = text[swap];
      text[swap] = text[swap + 1]
      text[swap + 1] = holder;
      $you.val(text.join(''));
    });

    $('#swap').click(function() {
      socket.emit('swap');
    });

    $('#remove').click(function() {
      socket.emit('remove');
    });
  });
});
