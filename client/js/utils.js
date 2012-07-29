$.hackadoo.utils = (function(){
  'use strict';
  
  return {
    // pad with zeros
    zeroPad: function(number, length) {
      var str = String(number);
      
      while (str.length < length) {
          str = '0' + str;
      }
      return str;
    }
  }; 
})();
