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
