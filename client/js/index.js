;(function() { 'use strict';
  $(document).ready(function() {

    // Bubble animation
    $('#bubble')
      .mouseenter(function(event) {
        $(this).stop(true, true);
        $(this).animate({
          width: '86px'
        , height: '86px'
        , 'margin-left': '-78px'
        , 'margin-top': '22px'
        });
        $(this).css('background-color', '#5382AF');
      })
      .mouseleave(function() {
        $(this).stop(true, false);
        $(this).animate({
          width: '70px'
        , height: '70px'
        , 'margin-left': '-70px'
        , 'margin-top': '30px'
        });
        $(this).css('background-color', '#386895');
      });
  });
})();
