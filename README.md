Ember-Parallel
==============

An Ember.js plugin proving integration with Parallel.js

This plugin allows you to run code inside web workers in the browser (i.e. in background threads) and access the results easily within your ember app. This is particularly useful when you're dealing with large quantities of data, or computationally expensive algorithms within your app that would otherwise lock up the browser for a period of time.

Requires
--------

* [Ember.js](http://emberjs.com)
* [Parallel.js](http://adambom.github.io/parallel.js/)

Builds
------

Find the current version in `build/`.

Find the latest stable release in `dist/`.

Note that Ember-Parallel is still new so should be considered unstable and subject to change without warning.

Demo
----

See the `demo/` folder for a demo.

Usage
-----

Ember-Parallel wraps [Parallel.js](http://adambom.github.io/parallel.js/) and makes it usable with Ember.js. To do this, it provides a few things:

###Computed Promises

Computed promises let you use promises as if they were computed properties. This means that you can create computed properties in an asynchronous manner and have them update asynchronously when dependencies change. Use them as follows:

```javascript
Em.computed.promise([deps...], func, [defaultValue])
```

`deps` are optional and specify dependencies for your promise
`func` is a function that returns a promise
`defaultValue` is optional and provides a value until the promise resolves

```javascript
App.Foo = Em.Object.extend({
	currentPage: 1,

	pageContents: Em.computed.promise('currentPage', function() {
		return $.getJSON('/api/todos?page=' + this.get('currentPage'));
	}, [])
});
```

`pageContents` can then be used as a regular computed property, with the last argument (`[]`) becoming the initial default value. When the promise has resolved, `pageContents will take on the fulfilled value of the promise.

The promise itself is also available at `pageContentsPromise`.

###Em.JSONify

As Ember-Parallel uses Web Workers, it needs to serialise Ember objects into plain old javaScript objects (POJOs). To do this, it expects every object to have a `toJSON` method on it. It provides a basic `toJSON` method with can then be replaced with custom, improved methods in your own code.

`Em.JSONify` is also provided, and converts any JS object (whether Ember or already a POJO) into a POJO.

```javsacript
var obj = Em.Object.create({ foo: 1 });

obj.toJSON();

Em.JSONify(obj);
```

###Parallel Computed Properties

Ember-Parallel provides some convenience wrappers around ParallelJS to help you work with web workers inside Ember.

The following computed properties are provided by default:

####Em.computed.parallel.map

```javascript
Em.computed.parallel.map(propName, func, initValue);
```
`propName` is the name of the property containing the list that you want to map over
`func` is a function that takes a single element of the list and transforms it is some way
`initValue` is returned when the map is running in the background

```javascript
App.foo = Em.Object.extend({
	list: [40, 41, 42],

	fibs: Em.computed.parallel.map('list', function fib(n) {
		return n < 2 ? 1 : fib(n - 1) + fib(n - 2);
	})
});
```

Note that the function fib needs to be named in order to deal with recursion, and that it cannot reference anything Ember related, or anything outside of the function itself. This is because the function is run inside a separate thread, so has no access to any other JS present outside that thread.

####Em.computed.parallel.reduce

```javascript
Em.computed.parallel.reduce(propName, func, initValue)
```
`propName` is the name of the property containing the list that you want to reduce
`func` is a function that takes a list containing two elements from the original list and returns a reduced value
`initValue` is a default value to use until the reduce function completes

```javascript
App.foo = Em.Object.extend({
	list: [40, 41, 42],

	total: Em.computed.parallel.reduce('list', function (list) {
		return list[0] + list[1];
	}, 0)
});
```

`Em.computed.reduce` takes property name to reduce on, a reducer function (note that the same restrictions as `Em.computed.parallel.map` apply), and a default initial value (in this case case 0. The reducer function take a list of two elements as the argument.

####Em.computed.parallel.spawn

```javascript
Em.computed.parallel.spawn(dep, func, initValue)
```
`dep` is the dependency that your spawn function relies on. `func` will be passed this dependency as an argument
`func` is a function that takes all of the data in `dep` and returns a completed value
`initValue` is a default value to use until the spawn function completes

```javascript
App.foo = Em.Object.extend({
	list: [40, 41, 42],

	total: Em.computed.parallel.spawn('list.[]', function (list) {
		return list.map(function(d) {
			return d * 2;
		}).reduce(function(total, d) {
			return d + total;
		}, 0);
	}, 0)
});
```
`Em.computed.parallel.spawn` is useful for operations that do no fit cleanly into parallel map/reduce but that still need to be done in the background. It runs the given function inside it's own web worker for you to do whatever you like with (e.g. sorting a list).

###Em.parallelConfig

```javascript
Em.parallelConfig = {
	maxWorkers: 4,
	evalPath: null
};
```

Set up some default config to be passed through to each created ParallelJS instance. Options and defaults are [the same as for paralleljs](http://adambom.github.io/parallel.js/#constructor). To use ember-parallel in IE, you'll need to grab eval.js from parallel.js and set `evalPath` here to its location.

###parallelDependencies

```javascript
App.foo = Em.Object.extend({
	list: [40, 41, 42],

	parallelDependencies: {
		fib: function(n) {
			return n < 2 ? 1 : fib(n - 1) + fib(n - 2);
		}
	}

	fibs: Em.computed.parallel.map('list', function(n) {
		return fib(n);
	}
});
```

`parallelDependencies` is a list of name/function pairs that you define on an Ember object. Any functions you define here will be available to you inside your Em.computed.parallel functions.
