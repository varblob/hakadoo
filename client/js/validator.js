'use strict';

jQuery.hackadoo.validator = ( function($) {

  function _generateOutputs(question, userCode){
    var attempt = eval('(' + userCode + ')')
      , outputs = []
      , i ;
      
    // Pass all the required tests
    for(i = 0; i < question.alwaysTest.length; i++){
      outputs.push(_getOutput(attempt,question.alwaysTest[i]));        
    }
    return outputs;
  }
  
  function _getOutput(f, input){
  	return f(input);
  }

  return {
    generateOutputs: _generateOutputs
  };

}(jQuery) );
