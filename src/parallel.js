(function() {

	function requireDependencies(context, parallel) {
		var dependencies = context.get('parallelDependencies');

		for (var dep in dependencies) if (dependencies.hasOwnProperty(dep)) {
			parallel.require({ name: dep, fn: dependencies[dep] });
		}
	}

	Em.computed.parallel = {

		map: function(data, fn) {
			return Em.computed.promise(data + '.[]', function() {
				var parallel = new Parallel(Em.JSONify(this.get(data)));

				requireDependencies(this, parallel);

				return parallel.map(fn);
			}, []);
		},

		reduce: function(data, fn, initValue) {
			return Em.computed.promise(data + '.[]', function() {
				var parallel = new Parallel(Em.JSONify(this.get(data)));

				requireDependencies(this, parallel);

				return parallel.reduce(fn);
			}, initValue);
		},

		spawn: function(data, fn, initValue) {
			data = data.replace(/(\.\[\]|\.@each.*)$/, '');
			return Em.computed.promise(data, function() {
				var parallel = new Parallel(Em.JSONify(this.get(data)));

				requireDependencies(this, parallel);

				return parallel.spawn(fn);
			}, initValue);
		}

	};

}());
