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

, {
    question: 'String to array of numbers corresponding to their position within the alphabet, anything not in the alphabet should be ignored.'
  , example: '"Bob likes to eat cats!" -> [1, 14, 1, 11, 8, 10, 4, 18, 19, 14, 4, 0, 19, 2, 0, 19, 18]'
  , answer: function(s){
      var i
        , ret = [];
      s = s.toLowerCase();
      s = s.replace(/[^a-z]/g, '');
      for(i = 0; i<s.length; i++){
        ret.push(s.charCodeAt(i) - 97);
      }
      return ret;
    }
  , alwaysTest: ['sthsn sCht.! tAeAc', 'stheu', 'TebuE931[.]-szvwweu= /a=/,.h3904']
  }
 
, {
    question: 'Sum the diagonals in a 2d array and add them together, assume the array is square.'
  , example: '[[1,0,1], [0,1,0], [1,0,1]] -> 6'
  , answer: function(s){
      var i, j, sum = 0;
      
      for(i=0; i < s.length; i++){
        j = s[i];
        sum += j[i] + j[j.length - i -1];
      }
      
      return sum;
    }
  , alwaysTest: [[[1,0,1], [0,1,0], [1,0,1]], [[1,0,0,1], [0,2,2,0], [0,1,1,0], [1,0,0,1]], [[1,3,3,1], [3,2,2,3], [0,1,1,0], [1,9,9,1]], [[1,3,4,3,1], [3,2,5,2,3], [0,1,6,1,0], [1,9,6,9,1], [2,3,3,7,7]]]
  }
];
