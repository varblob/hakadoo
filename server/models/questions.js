
module.exports = (function(){
	'use strict';
	
	var resourceful = require('resourceful-mongo')
	, q = resourceful.define('questions', function () {
	  this.use('mongodb', {
	    uri: "mongodb://localhost/hackadoo",
	    collection: "questions"
	  });
	
	  this.string('question');
	  this.string('example');
	  this.object('answer');
	  this.array('alwaysTest');
	  this.array('randomTest');
	});
	
	q.getQuestion = function(questionId, cb) {
	  this.get(questionId, function(error, item) {
	    if (error) { return cb(error); }
	    cb(item);
	  })
	};
	
	q.getRandomQuestion = function(cb) {
		this._collection.find().limit(-1).skip(Math.random() * this.count()).next()
	};
	
	q.getQuestions = function(cb){
		this.find({}, function(err, items){
			if(err){return cb(err);}
			cb(items);
		});
	};
	
	q.seed = function(cb){
		this.remove();
		this.save([
			
		]);
	};
	
	return q;
})();
