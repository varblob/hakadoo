;(function() { 'use strict';
  $(document).ready(function() {

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
  });
})();
