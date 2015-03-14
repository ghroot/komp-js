module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-watch');
    
    var srcFiles = [
            '<%= dirs.src %>/Komp.js',
            '<%= dirs.src %>/Signal.js',
            '<%= dirs.src %>/Entity.js',
            '<%= dirs.src %>/Component.js',
            '<%= dirs.src %>/World.js',
            '<%= dirs.src %>/System.js',
            '<%= dirs.src %>/NodeList.js',
            '<%= dirs.src %>/Node.js',
            '<%= dirs.src %>/EntityState.js',
            '<%= dirs.src %>/EntityStateMachine.js',
            '<%= dirs.src %>/WorldState.js',
            '<%= dirs.src %>/WorldStateMachine.js',
            '<%= dirs.src %>/../lib/class.js'
        ],
        banner = [
            '/**',
            ' * @license',
            ' * <%= pkg.name %> - v<%= pkg.version %>',
            ' * Compiled: <%= grunt.template.today("yyyy-mm-dd") %>',
            ' */',
            ''
        ].join('\n');

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        dirs: {
            build: 'bin',
            docs: 'docs',
            src: 'src/komp',
            test: 'test'
        },
        files: {
            srcBlob: '<%= dirs.src %>/**/*.js',
            testBlob: '<%= dirs.test %>/**/*.js',
            testConf: '<%= dirs.test %>/karma.conf.js',
            build: '<%= dirs.build %>/komp.dev.js',
            buildMin: '<%= dirs.build %>/komp.js'
        },
        concat: {
            options: {
                banner: banner
            },
            dist: {
                src: srcFiles,
                dest: '<%= files.build %>'
            }
        },
        /* jshint -W106 */
        concat_sourcemap: {
            dev: {
                files: {
                    '<%= files.build %>': srcFiles
                },
                options: {
                    sourceRoot: '../'
                }
            }
        },
        jshint: {
            options: {
                jshintrc: './.jshintrc'
            },
            source: {
                src: srcFiles.concat('Gruntfile.js'),
                options: {
                    ignores: '<%= dirs.src %>/**/{Komp,Komp}.js'
                }
            },
            test: {
                src: ['<%= files.testBlob %>'],
                options: {
                    ignores: '<%= dirs.test %>/lib/resemble.js',
                    jshintrc: undefined, //don't use jshintrc for tests
                    expr: true,
                    undef: false,
                    camelcase: false
                }
            }
        },
        uglify: {
            options: {
                banner: banner
            },
            dist: {
                src: '<%= files.build %>',
                dest: '<%= files.buildMin %>'
            }
        },
        connect: {
            test: {
                options: {
                    port: grunt.option('port-test') || 9002,
                    base: './',
                    keepalive: true
                }
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                logo: '<%= pkg.logo %>',
                options: {
                    paths: '<%= dirs.src %>',
                    outdir: '<%= dirs.docs %>'
                }
            }
        },
        //Watches and builds for _development_ (source maps)
        watch: {
            scripts: {
                files: ['<%= dirs.src %>/**/*.js'],
                tasks: ['concat_sourcemap'],
                options: {
                    spawn: false
                }
            }
        },
        karma: {
            unit: {
                configFile: '<%= files.testConf %>',
                // browsers: ['Chrome'],
                singleRun: true
            }
        }
    });

    grunt.registerTask('default', ['build', 'test']);

    //grunt.registerTask('build', ['jshint:source', 'concat', 'uglify']);
    grunt.registerTask('build', ['concat', 'uglify']);
    grunt.registerTask('build-debug', ['concat_sourcemap', 'uglify']);

    grunt.registerTask('test', ['concat', 'jshint:test', 'karma']);

    grunt.registerTask('docs', ['yuidoc']);
    grunt.registerTask('travis', ['build', 'test']);

    grunt.registerTask('debug-watch', ['concat_sourcemap', 'watch:debug']);
};
