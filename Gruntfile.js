module.exports = function(grunt) {
	"use strict";

	var path = require('path');

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		meta: {
			banner: '/**\n' +
				' * <%=pkg.name%> - v<%=pkg.version%>\n' +
				' * Copyright: 2014 Ben Gillies\n' +
				' * License: BSD License (see https://raw.github.com/bengillies/ember-parallel/master/LICENSE)\n' +
				' */\n\n'
		},

		clean: ['build'],

		watch: {
			files: 'src/**',
			tasks: 'concat:build'
		},

		concat: {
			options: {
				stripBanners: true,
				banner: '<%=meta.banner%>'
			},
			build: {
				src: 'src/**.js',
				dest: 'build/ember-parallel.js'
			},
			dist: {
				files: {
					 'dist/ember-parallel-<%=pkg.version%>.js': 'build/ember-parallel.js',
					 'dist/ember-parallel.js': 'build/ember-parallel.js'
				}
			}
		},

		uglify: {
			options: {
				banner: '<%=meta.banner%>',
				preserveComments: false,
				beautify: false,
				mangle: true,
				report: 'min'
			},
			build: {
				src: './dist/ember-parallel-<%=pkg.version%>.js',
				dest: './dist/ember-parallel-<%=pkg.version%>.min.js'
			}
		}
	});

	grunt.registerTask('build', ['clean', 'concat:build']);
	grunt.registerTask('dist', ['clean', 'concat:build', 'concat:dist', 'uglify']);
	grunt.registerTask('default', ['build']);
};
