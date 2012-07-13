exports.extend = function(from, to) {
	'use strict';
  var props = Object.getOwnPropertyNames(from);
  
	props.forEach(function(name) {
			var destination;
	    if(to.hasOwnProperty(name)) {
	        destination = Object.getOwnPropertyDescriptor(from, name);
	        Object.defineProperty(to, name, destination);
	    }
	});
	return to;
};
