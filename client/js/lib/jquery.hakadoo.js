"use strict";

jQuery.hakadoo = ( function( $ ) {
    
    var _questions = [
        {
            'question': "Write a function that sums the numbers 1 to n",
            'answer_key': "function HAKADOO_run2(n) { if (isNaN(n)) { return false; } return n * (n + 1)/2 }",
            'alwaysTest': [0, 1, 10],
            'randomTest': [2, 3, 4, 5, 6, 7, 8, 9],
        }
    ];
    
    function _validate(questionId, userCode) {
        var question = _questions[questionId];
        
        $.globalEval(userCode)
        $.globalEval(question['answer_key']);
        
        // Pass all the required tests
        for (var i = 0; i < question['alwaysTest'].length; i++) {
            if (run(question['alwaysTest'][i]) != HAKADOO_run2(question['alwaysTest'][i])) {
                return false;
            }
        }
        
        // Pass min(5, half of randomTest) tests
        var randomTest = question['randomTest'];
        
        // Shuffle the array
        randomTest.sort(function() { return 0.5 - Math.random() });
        
        for (var i = 0; i < Math.min(5, randomTest.length); i++) {
            if (run(randomTest[i]) != HAKADOO_run2(randomTest[i])) {
                return false;
            }
        }
        
        return true;
    }

    return {
        validate: _validate
    };

} ( jQuery ) );