module.exports = function ( grunt ) {
	var name = "<%= pkg.name %>-v<%= pkg.version%>"
	var reports = "reports/<%= pkg.name %>-"
	var subs = {
				"<%= config.dist.root %>index.html": "<%= config.app.tpl %>index.pug",
				"<%= config.dist.root %>promo/index.html": "<%= config.app.tpl %>index-promo.pug",
				"<%= config.dist.root %>free/index.html": "<%= config.app.tpl %>index-free.pug",
				"<%= config.dist.root %>fb/index.html": "<%= config.app.tpl %>index-facebook.pug"
			}

	grunt.initConfig( {
		config: {
			lib: "bower_components/",
			tmp: "temp/",
			app: {
				root: "app/",
				less: "app/styles/",
				img: "app/images/",
				tpl: "app/views/",
			},
			dist: {
				root: "build/",
				img: "build/img/"
			}
		},

		pkg: grunt.file.readJSON( "package.json"),

		banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
					'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
						'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
						'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
						' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

		// ///////////////////////////////////////////////////////////////// scaffold
		copy: {
			lesslib: {
				expand: true,
				// flatten: true,
				cwd: "<%= config.lib %>",
				src: [
					"bootstrap/less/**"
				],
				dest: "<%= config.app.less %>"
			},
			favicons: {
				expand: true,
				flatten: true,
				src: "<%= config.app.img %>favicons/*",
				dest: "<%= config.dist.root %>"
			}
		},

		// ///////////////////////////////////////////////////////////////// compile
		less: {
			dev: {
				options: {
					cleancss: false
				},
				files: {"<%= config.dist.root %>style.min.css": ["<%= config.app.less %>style.less"] }
			},
			production: {
				options: {
					path: "<%= config.app.less %>",
					compress: true,
					cleancss: true
				},
				files: {"<%= config.dist.root %>style.min.css": ["<%= config.app.less %>style.less"] }
			},
		},

		pug: {
			compile: {
				options: {
					pretty: true,
					data: {
						debug: false
					}
				},
				files: subs
			}
		},

	realFavicon: {
		favicons: {
			src: "<%= config.app.img %>NN-logo-n.svg",
			dest: "<%= config.app.img %>favicons/",
			options: {
				iconsPath: "/",
				html: "",
				design: {
					ios: {
						pictureAspect: 'backgroundAndMargin',
						backgroundColor: '#FFF',
						margin: '14%'
					},
					desktopBrowser: {},
					windows: {
						pictureAspect: 'noChange',
						backgroundColor: '#FFF',
						onConflict: 'override'
					},
					androidChrome: {
						pictureAspect: 'noChange',
						themeColor: '#FFF',
						manifest: {
							name: 'Net Nanny',
							display: 'browser',
							orientation: 'notSet',
							onConflict: 'override',
							declared: true
						}
					},
					safariPinnedTab: {
						pictureAspect: 'blackAndWhite',
						threshold: 58.75,
						themeColor: '#FFF'
					}
				},
				settings: {
					compression: 4,
					scalingAlgorithm: 'Mitchell',
					errorOnImageTooSmall: false
				},
				versioning: {
					paramName: 'v1',
					paramValue: 'favicon'
				}
			}
		}
	},

	// ///////////////////////////////////////////////////////////////// minifying
	htmlmin: {
		dist: {
			options: {
				removeComments: false,
				removeAttributeQuotes: false,
				useShortDocType: true,
				collapseWhitespace: true
			},
			files: {
				"<%= config.dist.root %>index.html": "<%= config.dist.root %>index.html",
				"<%= config.dist.root %>promo/index.html": "<%= config.dist.root %>promo/index.html",
				"<%= config.dist.root %>fb/index.html": "<%= config.dist.root %>fb/index.html",
				"<%= config.dist.root %>free/index.html": "<%= config.dist.root %>free/index.html"
				}
		}
	},

	imagemin: {
		site: {
			options: {
				optimizationLevel: 5,
				pngquant: true
			},
			files: [ {
				expand: true,
				cwd: "<%= config.app.img %>",
				src: [ '*.{png,jpg,gif,svg}' ],
				dest: "<%= config.dist.img %>"
			} ]
		}
	},

	cssmin: {
		options: {
			shorthandCompacting: false,
			roundingPrecision: -1
		},
		target: {
			files: {
				"<%= config.dist.root %>style.min.css": ["<%= config.dist.root %>style.min.css"]
			}
		},
	},

	combine_mq: {
		default_options: {
			expand: true,
			cwd: "<%= config.dist.root %>",
			src: "*.css",
			dest: "<%= config.dist.root %>"
		}
	},

	// ///////////////////////////////////////////////////////////////// build / deploy / workflow
	'sftp-deploy': {
		build: {
			auth: {
				host: 'server.com',
				port: 22,
				authKey: 'key1'
			},
			src: "<%= config.dist.root %>",
			dest: '/path/to/destination/folder',
			concurrency: 4,
			progress: true
		}
	},
	connect: {
		server: {
			options: {
				port: "9001",
				base: "build/",
				protocol: "http",
				hostname: "localhost",
				livereload: true,
				open: {
					target: "http://localhost:9001/index.html", // target url to open
					appName: "Chrome"
				},
			}
		}
	},

	watch: {
		build: {
			files: [
				"Gruntfile.js",
				"<%= config.app.root %>**/*"
			],
			tasks: [ "pug", "less:dev", "combine_mq", "newer:imagemin" ],
			options: {
				reload: false,
				livereload: true,
				spawn: true,
				dateFormat: function ( time ) {
					grunt.log.writeln( "The watch finished in " + time + "ms at" + ( new Date( ) ).toString( ) )
				}
			}
		}
	}
});

	require( "matchdep" ).filterDev( "grunt-*" ).forEach( grunt.loadNpmTasks )

	// Develop
	grunt.registerTask( "default", [ "connect", "watch" ] )

	// Build for Production
	grunt.registerTask( "build", [ "copy", "pug", "less:dev", "combine_mq", "htmlmin", "cssmin", "imagemin"] )
}