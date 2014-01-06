Em.computed.parallel = {

	map: function(data, fn) {
		return Em.computed.promise([], function() {
			return new Parallel(Em.JSONify(this.get(data))).map(fn);
		});
	},

	reduce: function(data, fn, initValue) {
		return Em.computed.promise(initValue, function() {
			return new Parallel(Em.JSONify(this.get(data))).reduce(fn);
		});
	},

	spawn: function(data, fn, initValue) {
		return Em.computed.promise(initValue, function() {
			return new Parallel(Em.JSONify(this.get(data))).spawn(fn);
		});
	}

};
