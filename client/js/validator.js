"use strict";

jQuery.hakadoo.validator = ( function($) {

  function _generateOutputs(question, userCode){
    var attempt = eval('(' + userCode + ')')
    	, outputs = []
    	, i ;
    	
    // Pass all the required tests
    for(i = 0; i < question.alwaysTest.length; i++){
      outputs.push(attempt(question.alwaysTest[i]));        
    }
    return outputs;
  }

  return {
    generateOutputs: _generateOutputs
  };

}(jQuery) );
