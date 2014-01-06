/**
 * ember-parallel - v0.0.1
 * Copyright: 2014 Ben Gillies
 * License: BSD License (see https://raw.github.com/bengillies/ember-parallel/master/LICENSE)
 */

Em.Object.reopen({
	toJSON: function() {
		var v, ret = [], recursed = {};
		if (this.toArray) {
			return this.toArray().map(function(d) {
				return d && d.toJSON ? d.toJSON : d;
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

Em.computed.promise = function(defaultValue, fn) {
	if (typeof fn == 'undefined') {
		fn = defaultValue;
		defaultValue = undefined;
	}

	return Em.computed(function(propertyName, value) {
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
	});
};
