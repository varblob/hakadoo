var resourceful = require('resourceful-mongo')
  , config = require('flatiron').app.config
  ;

var Question = module.exports = resourceful.define('questions', function() {
  this.use('mongodb', {
    uri: config.get('mongoURI'),
    collection: "questions",
  });

  this.string('question');
  this.string('example');
  this.string('answerKey');
  this.array('alwaysTest');
  this.array('randomTest');
});

function getQuestion(questionId, fn) {
  Person.get(questionId, function(error, item) {
    if (error) { return fn(error); }
    fn(item);
  })
}

function getRandomQuestion(fn) {
    Person.get('')
}
