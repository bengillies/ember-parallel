/**
 * ember-parallel - v0.0.3
 * Copyright: 2014 Ben Gillies
 * License: BSD License (see https://raw.github.com/bengillies/ember-parallel/master/LICENSE)
 */

Em.Object.reopen({
	toJSON: function() {
		var v, ret = [], recursed = {};
		if (this.toArray) {
			return this.toArray().map(function(d) {
				return d && d.toJSON ? d.toJSON() : d;
			});
		}
		for (var key in this) {
			v = this[key];
			if (v === 'toString') {
				continue;
			} // ignore useless items
			if (Ember.typeOf(v) === 'function' ||
					Em.typeOf(v) === 'class' ||
					key === 'concatenatedProperties' ||
					key === 'isDestroyed' ||
				key === 'isDestroying') {
				continue;
			}
			if (v && v.toArray) {
				recursed[key] = v.toArray().map(function(a) {
					return a && a.toJSON ? a.toJSON() : a;
				});
			} else if (v && v.toJSON) {
				recursed[key] = v.toJSON();
			}
			ret.push(key);
		}
		return $.extend(this.getProperties.apply(this, ret), recursed);
	}
});

Em.JSONify = function(obj) {
	if (!obj) {
		return obj;
	} else if (obj.toJSON) {
		return obj.toJSON();
	} else if (obj.toArray) {
		return obj.toArray().map(function(d) {
			return d && d.toJSON ? d.toJSON() : d;
		});
	}
};

(function() {

	function requireDependencies(context, parallel) {
		var dependencies = context.get('parallelDependencies');

		for (var dep in dependencies) if (dependencies.hasOwnProperty(dep)) {
			parallel.require({ name: dep, fn: dependencies[dep] });
		}
	}

	function wrapPromise(promise) {
		return new Em.RSVP.Promise(function(resolve) {
			promise.then(function(data) {
				resolve(data);
			});
		});
	}

	Em.parallelConfig = {
		maxWorkers: 4,
		evalPath: null
	};

	Em.computed.parallel = {

		map: function(data, fn, initValue) {
			return Em.computed.promise(data + '.[]', function() {
				var parallel = new Parallel(Em.JSONify(this.get(data)), Em.parallelConfig);

				requireDependencies(this, parallel);

				return wrapPromise(parallel.map(fn));
			}, initValue);
		},

		reduce: function(data, fn, initValue) {
			return Em.computed.promise(data + '.[]', function() {
				var parallel = new Parallel(Em.JSONify(this.get(data)), Em.parallelConfig);

				requireDependencies(this, parallel);

				return wrapPromise(parallel.reduce(fn));
			}, initValue);
		},

		spawn: function(dependency, fn, initValue) {
			var data = dependency.replace(/(\.\[\]|\.@each.*)$/, '');
			return Em.computed.promise(dependency, function() {
				var parallel = new Parallel(Em.JSONify(this.get(data)), Em.parallelConfig);

				requireDependencies(this, parallel);

				return wrapPromise(parallel.spawn(fn));
			}, initValue);
		}

	};

}());

Em.computed.promise = function(/*deps..., fn, defaultValue*/) {
	var defaultValue = arguments[arguments.length - 1],
		fnPos = arguments.length - (typeof defaultValue == 'function' ? 1 : 2),
		args = [].slice.call(arguments, 0, arguments.length - 2),
		fn = arguments[fnPos];
	defaultValue = arguments[fnPos + 1];

	var computedPromise = function(propertyName, value) {
		if (arguments.length == 2) {
			return value;
		}

		var self = this;
		self.set(propertyName + 'Promise',
			new Em.RSVP.Promise(function(resolve, reject) {
				resolve(fn.call(self));
			}).then(function(data) {
				if (self.get(propertyName) !== data) {
					self.set(propertyName, data);
				}

				return data;
			}));

		return defaultValue;
	};

	args.push(computedPromise);

	return Em.computed.apply(Em.computed, args);
};
