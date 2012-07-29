;(function() { 'use strict';
  $(document).ready(function() {
    $('#centered')
      .mouseenter(function() { 
        $(this).css('background-color', '#224A7C'); 
      })
      .mouseleave(function() {
         $(this).css('background-color', '#133969'); 
      });

    // Quick POC for cursor blink
    var $cursorBlink = $('.cursor-blink')
      , timeoutID;

    $('#title')
      .mouseenter(function() {
        $cursorBlink.addClass('blink-on');

        (function blink() { 
          timeoutID = setTimeout(function() {
            $cursorBlink.each(function() { 
              if ($(this).hasClass('blink-on')) {
                $(this).removeClass('blink-on');
              } else {
                $(this).addClass('blink-on');         
              }
            });
            blink();
          }, 600);
        })();
      })
      .mouseleave(function() {
        $cursorBlink.removeClass('blink-on');
        clearTimeout(timeoutID);
      });

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
