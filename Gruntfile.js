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
                    separator: '\n',
                    process: function(src, filepath) {
                        var banner = '/*! ' + filepath + ' */\n';
                        var BEGEIN = '// BEGIN(BROWSER)\n',
                            END = '// END(BROWSER)';
                        var indexOfBEGEIN = src.indexOf(BEGEIN),
                            indexOfEND = src.indexOf(END);
                        if (indexOfBEGEIN != -1 && indexOfEND != -1) {
                            return banner + src.slice(indexOfBEGEIN + BEGEIN.length, indexOfEND)
                        }
                        return banner + src
                    }
                },
                src: [
                    'src/fix/prefix-1.js',
                    'src/expose.js',
                    'src/fix/prefix-2.js',

                    'src/loop.js',
                    'src/ast.js',
                    'src/scan.js',
                    'src/flush.js',
                    'src/bisheng.js',

                    'src/fix/suffix.js'
                ],
                dest: 'dist/bisheng.js'
            }
        },
        nodeunit: {
            options: {
                verbose: true
            },
            all: ['test/nodeuinit/watch.js']
        },
        qunit: {
            files: ['test/*.html']
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd hh:MM:ss TT Z") %> */\n'
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
                    sourceMap: 'dist/bisheng-min.map'
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
                files: ['<%= jshint.files %>', 'src/fix/*', 'doc/*.md', 'doc/template.html'],
                tasks: ['jshint','concat', 'uglify', 'qunit', 'markdown'] // 'nodeunit'
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
            }
        }
    })

    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-contrib-nodeunit')
    grunt.loadNpmTasks('grunt-contrib-qunit')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-connect')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-markdown')

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'qunit', 'markdown', 'connect', 'watch:dev']) // , 'nodeunit'
    grunt.registerTask('doc', ['markdown', 'connect', 'watch:doc'])
    grunt.registerTask('travis', ['jshint', 'qunit']) // grunt travis --verbose
};