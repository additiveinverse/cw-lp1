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
        tasks: [ "pug", "less:dev" ],
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
  grunt.registerTask( "build", [ "copy", "pug", "less:production", "combine_mq", "htmlmin", "cssmin" ] )

}