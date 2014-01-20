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
