'use strict';

var Mock = require('./bower_components/mockjs/dist/mock.js')

// http://www.network-science.de/ascii/ doom
console.log(Mock.heredoc(function() {
    /*
______   _   _____   _                                    _       
| ___ \ (_) /  ___| | |                                 (_)      
| |_/ /  _  \ `--.  | |__     ___   _ __     __ _        _   ___ 
| ___ \ | |  `--. \ | '_ \   / _ \ | '_ \   / _` |      | | / __|
| |_/ / | | /\__/ / | | | | |  __/ | | | | | (_| |  _   | | \__ \
\____/  |_| \____/  |_| |_|  \___| |_| |_|  \__, | (_)  | | |___/
                                             __/ |     _/ |      
                                            |___/     |__/       
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
                    'src/locator.js',
                    'src/ast.js',
                    'src/scan.js',
                    'src/flush.js',
                    'src/html.js',
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
            files: ['test/*.html', '!test/table.html', '!test/crox.html']
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
                    preserveComments: 'all' // false all some
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
                files: ['<%= jshint.files %>', 'src/fix/*', 'test/*'], // , 'doc/*.md', 'doc/template.html'
                tasks: ['jshint', 'concat', 'uglify', 'qunit', 'markdown', 'cleaver'] // 'nodeunit'
            },
            markdown: {
                files: ['doc/*.md', 'doc/template*.html', '!doc/what.md'],
                tasks: ['markdown']
            },
            cleaver: {
                files: ['doc/what.md'],
                tasks: ['cleaver']
            }
        },
        markdown: {
            index: {
                options: {
                    template: 'doc/template_index.html'
                },
                expand: true,
                cwd: 'doc/',
                src: ['index.md'],
                dest: 'doc/',
                ext: '.html'
            },
            doc: {
                options: {
                    template: 'doc/template.html'
                },
                expand: true,
                cwd: 'doc/',
                src: ['*.md', '!index.md', '!what.md'],
                dest: 'doc/',
                ext: '.html'
            }
        },
        cleaver: {
            doc: {
                expand: true,
                cwd: 'doc/',
                src: ['what.md'],
                dest: 'doc/',
                ext: '.html'
            }
        },
        copy: {
            doc: {
                files: [{
                    expand: true,
                    src: [
                        'dist/**',
                        'doc/**',
                        'demo/**',
                        'test/**',
                        'bower_components/**',
                        'node_modules/grunt-contrib-qunit/test/libs/**'
                    ],
                    dest: '../bishengjs.github.io/'
                }, {
                    expand: true,
                    cwd: './',
                    src: ['index.html', 'bishengjs.png'],
                    dest: '../bishengjs.github.io/'
                }]
            },
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
    grunt.loadNpmTasks('grunt-cleaver')
    grunt.loadNpmTasks('grunt-contrib-copy')

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'qunit', 'markdown', 'cleaver', 'connect', 'watch']) // , 'nodeunit'
    grunt.registerTask('doc', ['markdown', 'cleaver', 'copy', 'connect', 'watch'])
    grunt.registerTask('travis', ['jshint', 'qunit']) // grunt travis --verbose
};