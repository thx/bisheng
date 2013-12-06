'use strict';

var Mock = require('./bower_components/mockjs/dist/mock.js')
console.log(Mock.heredoc(function() {
    /*
 _   _           _      
| | | |         | |     
| |_| |_   _  __| | ___ 
|  _  | | | |/ _` |/ _ \
| | | | |_| | (_| |  __/
\_| |_/\__, |\__,_|\___|
        __/ |           
       |___/            
     */
}))

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'package.json', 'src/*.js', 'test/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        nodeunit: {
            options: {
                verbose: true
            },
            all: ['test/nodeuinit/watch.js']
        },
        connect: { // :server:keepalive
            server: {
                options: {
                    keepalive: true,
                    port: 5000,
                    base: '.',
                    hostname: '0.0.0.0'
                }
            }
        },
        watch: {
            dev: {
                files: ['<%= jshint.files %>'],
                tasks: ['jshint', 'nodeunit', 'markdown']
            }
        },
        markdown: {
            options: {
                template: 'doc/template.html'
            },
            doc: {
                expand: true,
                cwd: 'doc/',
                src: ['index.md'],
                dest: './',
                ext: '.html'
            }
        }
    })

    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-contrib-nodeunit')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-connect')
    grunt.loadNpmTasks('grunt-markdown')

    grunt.registerTask('default', ['jshint', 'nodeunit', 'markdown', 'connect', 'watch'])
    grunt.registerTask('doc', ['markdown'])
};