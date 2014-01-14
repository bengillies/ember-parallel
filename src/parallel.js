Em.computed.parallel = {

	map: function(data, fn) {
		return Em.computed.promise(data + '.[]', function() {
			return new Parallel(Em.JSONify(this.get(data))).map(fn);
		}, []);
	},

	reduce: function(data, fn, initValue) {
		return Em.computed.promise(data + '.[]', function() {
			return new Parallel(Em.JSONify(this.get(data))).reduce(fn);
		}, initValue);
	},

	spawn: function(data, fn, initValue) {
		data = data.replace(/(\.\[\]|\.@each.*)$/, '');
		return Em.computed.promise(data, function() {
			return new Parallel(Em.JSONify(this.get(data))).spawn(fn);
		}, initValue);
	}

};
