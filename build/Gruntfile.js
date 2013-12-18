module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    
    uglify: {
      dist: {
        files: {
          '../js/<%= pkg.name %>.min.js': ['../js/cyclops.js']
        }
      }
    }
    });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);
};