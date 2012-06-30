"use strict";

jQuery.hakadoo = ( function( $ ) {
    
    var _questions = [
        {
            'question': "Write a function that sums the numbers 1 to n",
            'example': "run(5) -> 15",
            'answer_key': 'function HAKADOO_run2(n) { if (isNaN(n)) { return false; } return n * (n + 1)/2 }',
            'alwaysTest': [0, 1, 10],
            'randomTest': [2, 3, 4, 5, 6, 7, 8, 9],
        },
        {
            'question': "Write a function that reverses the word order (but not the words themselves) in a sentance",
            'example': 'run("How are you?") -> you? are How',
            'answer_key': 'function HAKADOO_run2(s) { return s.split(" ").reverse().join(" "); }',
            'alwaysTest': ["Hello world!", "JustOneWord", "One Two Three Four Five"],
            'randomTest': ["Five minus Four = 1"],
        },
        {
            'question': "Given an array of 3 int values, a b c, return their sum. However, if one of the values is 13 then it does not count towards the sum and values to its right do not count. So for example, if b is 13, then both b and c do not count.",
            'example': "run([1, 2, 3]) -> 6, run([1, 2, 13]) -> 3, run([1, 13, 2]) -> 1",
            'answer_key': 'function HAKADOO_run2(s) { var result = 0; for (var i = 0; i < s.length; i++) { if (s[i] == 13) { i++; } else { result += s[i]; } } return result; }',
            'alwaysTest': [[1, 2, 3], [3, 5, 13], [1, -13, 2], [13, 13, 2], [-13, 13, 2], [13, 13, 13]],
            'randomTest': [[1, 13, 4], [99, -13, 33], [13, -13, 13]],
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
        validate: _validate,
        questions: _questions
    };

} ( jQuery ) );