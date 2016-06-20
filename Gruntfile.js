module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    availabletasks: {
      tasks: {
        options: {
          filter: 'exclude',
          tasks: ['availabletasks', 'default', 'concat', 'uglify']
        }
      }
    },

    concat: {
      cardiac_risk: {
        files: {
          'build/js/cardiac_risk.js': [
            'src/js/cardiac_risk.js',
            'src/js/cardiac_risk_controller.js',
            'src/js/cardiac_risk_polyfill.js',
            'src/js/static_range_slider.js',
            'src/js/static_range_slider_controller.js'
          ]
        }
      }
    },

    mocha_phantomjs: {
      all: ['test/*.html']
    },

    uglify: {
      cardiac_risk: {
        files: {
          'build/js/cardiac_risk.min.js': ['build/js/cardiac_risk.js']
        }
      }
    },

    jshint: {
      files: [
        'Gruntfile.js' ,
        'build/js/cardiac_risk.js',
        'test/*.js'],
      options: {
        globals: {
          jQuery: true,
          mocha: true,
          phantom: true,
          force: true

        }
      }
    },

    less: {
      cardiac_risk: {
        options: {
          paths: ['src/less']
        },
        files: {
          'src/stylesheets/cardiac_risk.css': ['src/less/cardiacRisk.less', 'src/less/tooltipster-CardiacRisk.less', 'src/stylesheets/tooltipster.css']
        }
      }
    },

    cssmin: {
      cardiac_risk: {
        files: {
          'build/stylesheets/cardiac_risk.css': ['src/stylesheets/cardiac_risk.css']
        }
      }
    },

    'gh-pages': {
      options: {
        add: true,
        user: {
          name: 'Zach Plata',
          email: 'plata.zach@gmail.com'
        },
        move: [{base: 'build', src: '**/*', dest: 'build'}]
      },
      src: ['build/**/*', 'index.html', 'launch.html', '.gitignore', 'README.md', 'images/*']
    }

  });

  grunt.registerTask('default', ['availabletasks']);

  grunt.registerTask('test', ['mocha_phantomjs']);

  grunt.registerTask('build', ['less', 'cssmin', 'concat', 'jshint', 'uglify']);

  grunt.registerTask('push', ['gh-pages']);

};