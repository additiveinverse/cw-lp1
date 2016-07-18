module.exports = function ( grunt ) {
  var name = "<%= pkg.name %>-v<%= pkg.version%>"
  var reports = "reports/<%= pkg.name %>-"

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
        dest: "<%= config.dist.img %>fi/"
      }
    },

    // ///////////////////////////////////////////////////////////////// linting / testing / cleanup
    lesslint: {
      src: "<%= config.app.less %>*.less",
      csslintrc: ".csslintrc",
      options: {
        formatters: [ {
          id: "text",
          dest: reports + "CSSlint.txt"
        } ]
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
      }
    },

    pug: {
      compile: {
        options: {
          pretty: true,
          data: {
            debug: false
          }
        },
        files: {
          "build/index.html": ["app/views/index.pug"]
        }
      }
    },

    realFavicon: {
      favicons: {
        src: "<%= config.app.img %>NN-logo-n.svg",
        dest: "<%= config.app.img %>favicons/",
        options: {
          iconsPath: '/img/favs/',
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
          "<%= config.dist.root %>index.html": "<%= config.dist.root %>index.html"
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
  } );

  require( "matchdep" ).filterDev( "grunt-*" ).forEach( grunt.loadNpmTasks )

  // init
  // grunt.registerTask( "devint", [ "concat", "copy", "ngtemplates", "imgprep", "dataprep" ] )

  // Develop
  grunt.registerTask( "default", [ "connect", "watch" ] )

  // Build for Production
  grunt.registerTask( "build", [ "copy", "pug", "less:production", "combine_mq", "htmlmin", "cssmin", "imagemin"] )

}