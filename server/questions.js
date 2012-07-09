/*
 * This contains all the questions to be delivered in the app
 */

module.exports = [
  {
    question: 'Write a function that sums the numbers 1 to n'
  , example: 'run(5) -> 15'
  , answer: function(n){
      if (isNaN(n)) {
        return false;
      }
      return n * (n + 1)/2;
    }
  , alwaysTest: [0, 1, 10]
  , randomTest: [2, 3, 4, 5, 6, 7, 8, 9]
  }
  
, {
    question: 'Write a function that reverses the word order (but not the words themselves) in a sentence'
  , example: 'run("How are you?") -> you? are How'
  , answer: function(s) {
      return s.split(" ").reverse().join(" ");
    }
  , alwaysTest: ["Hello world!", "JustOneWord", "One Two Three Four Five"]
  , randomTest: ["Five minus Four = 1"]
  }
  
, {
    question: 'Given an array of 3 int values, a b c, return their sum. However, if one of the values is 13 then it does not count towards the sum and the immediate value to its right does not count. So for example, if b is 13, then both b and c do not count.'
  , example: 'run([1, 2, 3]) -> 6, run([1, 2, 13]) -> 3, run([1, 13, 2]) -> 1'
  , answer: function(s) {
      var result = 0
        , i; 

      for (i = 0; i < s.length; i++) {
        if (s[i] === 13) {
          i++;
        } else {
          result += s[i];
        }
      }
      
      return result;
    }
  , alwaysTest: [[1, 2, 3], [3, 5, 13], [1, -13, 2], [13, 13, 2], [-13, 13, 2], [13, 13, 13]]
  , randomTest: [[1, 13, 4], [99, -13, 33], [13, -13, 13]]
  }
];
