App = Ember.Application.create();

App.Router.map(function() {
	// put your routes here
});

App.IndexRoute = Ember.Route.extend({
	model: function() {
		return [40, 41, 42];
	}
});

App.IndexController = Em.ArrayController.extend({

	promisified: Em.computed.promise([], function() {
		var self = this;
		return new Em.RSVP.Promise(function(resolve) {
			Em.run.later(function() {
				resolve(self.get('model'));
			}, 2000);
		});
	}).property('@each'),

	sum: Em.computed(function() {
		return this.get('promisified').reduce(function(acc, num) {
			return acc + num;
		}, 0);
	}).property('promisified.[]'),

	fibs: Em.computed.parallel.map('model', function fib(n) {
		return n < 2 ? 1 : fib(n - 1) + fib(n - 2);
	}).property('model.[]'),

	fibString: Em.computed(function() {
		return this.get('fibs').join(', ') || 'working...';
	}).property('fibs.[]'),

	facTotal: Em.computed.parallel.reduce('model', function(vals) {
		return {
			data: vals.reduce(function(acc, val) {
				var res, fac = 1;
				if (typeof val == 'number') {
					for (var i = 1; i <= val; i++) fac *= i;
					res = fac;
				} else {
					res = val.data;
				}

				return acc + res;
			}, 0)
		};
	}, { data: 0 }).property('model.[]'),

	fibTotal: Em.computed.parallel.spawn('fibs', function(fibs) {
		return fibs.reduce(function(acc, t) { return acc + t; }, 0);
	}).property('fibs.[]'),

	timer: function() {
		var self = this;
		self.set('counter', 0);
		setInterval(function() {
			Em.run(function() { self.incrementProperty('counter'); });
		}, 100);
	}.on('init')

});
