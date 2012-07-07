var resourceful = require('resourceful-mongo');

var Question = resourceful.define('questions', function () {
  this.use('mongodb', {
    uri: "mongodb://localhost/databaseName",
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