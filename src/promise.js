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
