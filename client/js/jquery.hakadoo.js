"use strict";

jQuery.hakadoo = ( function($) {

    var _questions = [{
	      question: 'Write a function that sums the numbers 1 to n',
	      example: 'run(5) -> 15',
	      answerKey: 'function(n) { if (isNaN(n)) { return false; } return n * (n + 1)/2 }',
	      alwaysTest: [0, 1, 10],
	      randomTest: [2, 3, 4, 5, 6, 7, 8, 9]
	      
	    }, {
	      question: 'Write a function that reverses the word order (but not the words themselves) in a sentence',
	      example: 'run("How are you?") -> you? are How',
	      answerKey: 'function(s) { return s.split(" ").reverse().join(" "); }',
	      alwaysTest: ["Hello world!", "JustOneWord", "One Two Three Four Five"],
	      randomTest: ["Five minus Four = 1"]
	    }, {
	      question: 'Given an array of 3 int values, a b c, return their sum. However, if one of the values is 13 then it does not count towards the sum and the immediate value to its right does not count. So for example, if b is 13, then both b and c do not count.',
	      example: 'run([1, 2, 3]) -> 6, run([1, 2, 13]) -> 3, run([1, 13, 2]) -> 1',
	      answerKey: 'function(s) { var result = 0; for (var i = 0; i < s.length; i++) { if (s[i] == 13) { i++; } else { result += s[i]; } } return result; }',
	      alwaysTest: [[1, 2, 3], [3, 5, 13], [1, -13, 2], [13, 13, 2], [-13, 13, 2], [13, 13, 13]],
	      randomTest: [[1, 13, 4], [99, -13, 33], [13, -13, 13]]
	    }]
	    , i 
	    , randomTest;

    function _validate(questionId, userCode){
      var question = _questions[questionId]
				, solution = $.globalEval(userCode)
				, attempt = $.globalEval(question.answerKey);      

      // Pass all the required tests
      for(i = 0; i < question.alwaysTest.length; i++){
        if(attempt(question.alwaysTest[i]) !== solution(question.alwaysTest[i])){
          return false;
        }
      }

      // Pass min(5, half of randomTest) tests
      randomTest = question.randomTest;

      // Shuffle the array
      randomTest.sort(function() {
        return 0.5 - Math.random();
      });

      for(i = 0; i < Math.min(5, randomTest.length); i++) {
        if(attempt(randomTest[i]) !== solution(randomTest[i])) {
          return false;
        }
      }

      return true;
    }

    return {
      validate: _validate
      , questions: _questions
    };

  }(jQuery) );