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
        concat: {
            dist: {
                options: {
                    separator: '\n\n',
                    process: function(src, filepath) {
                        var banner = '/*! ' + filepath + ' */\n';
                        return banner + src
                    }
                },
                src: [
                    'src/expose.js',
                    'src/loop.js',
                    'src/ast.js',
                    'src/scan.js',
                    'src/flush.js',
                    'src/hyde.js'
                ],
                dest: 'dist/hyde.js'
            }
        },
        nodeunit: {
            options: {
                verbose: true
            },
            all: ['test/nodeuinit/watch.js']
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dev: {
                options: {
                    beautify: true,
                    compress: false,
                    mangle: false,
                    preserveComments: 'some' // false all some
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**/*.js', '!**/*-min.js'],
                    dest: 'dist/',
                    ext: '.js'
                }]
            },
            release: {
                options: {
                    sourceMap: 'dist/hyde-min.map'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**/*.js', '!**/*-min.js'],
                    dest: 'dist/',
                    ext: '-min.js'
                }]
            }
        },
        connect: { // grunt connect:server:keepalive
            server: {
                options: {
                    // keepalive: true,
                    port: 5000,
                    base: '.',
                    hostname: '0.0.0.0'
                }
            }
        },
        watch: {
            dev: {
                files: ['<%= jshint.files %>', 'doc/*.md', 'doc/template.html'],
                tasks: ['jshint', 'uglify', 'markdown', 'concat'] // 'nodeunit'
            },
            doc: {
                files: ['doc/*.md', 'doc/template.html'],
                tasks: ['markdown']
            }
        },
        markdown: {
            options: {
                template: 'doc/template.html'
            },
            doc: {
                expand: true,
                cwd: 'doc/',
                src: ['*.md'],
                dest: 'doc/',
                ext: '.html'
            },
            index: {
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
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-markdown')

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'markdown', 'connect', 'watch:dev']) // , 'nodeunit'
    grunt.registerTask('doc', ['markdown', 'connect', 'watch:doc'])
};