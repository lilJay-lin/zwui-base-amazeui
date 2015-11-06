/* jshint -W097*/
/* jshint node:true */

'use strict';

var path = require('path');
var fs = require('fs');
var format = require('util').format;
var _ = require('lodash');
var browserify = require('browserify');
var watchify = require('watchify');
var collapser = require('bundle-collapser/plugin');
var derequire = require('derequire/plugin');
var del = require('del');
var bistre = require('bistre');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var browersync = require('browser-sync');

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var pkg = require('./package.json');

var config = {
    path: {
        less: [
            './less/zwui.less',
            //'./less/themes/flat/amazeui.flat.less'
        ],
        js:[
            './js'
        ],
        fonts: './fonts/*',
        widgets: [
            '*/src/*.js',
            '!{layout*,blank,container}' +
            '/src/*.js'],
        hbsHelper: [
            'vendor/amazeui.hbs.helper.js',
            'vendor/amazeui.hbs.partials.js'],
        buildTmp: '.build/temp/'
    },
    dist: {
        js: './dist/js',
        css: './dist/css',
        fonts: './dist/fonts'
    },
    examples:{
        js: './docs/examples/assets/js',
        css: './docs/examples/assets/css'
    },
    js: {
        base: [
            'core.js'
            //'util.hammer.js'
        ]
    },

    AUTOPREFIXER_BROWSERS: [
        'ie >= 8',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 2.3',
        'bb >= 10'
    ],
    uglify: {
        compress: {
            warnings: false
        },
        output: {
            ascii_only: true
        }
    }
};

var dateFormat = 'isoDateTime';

/*var banner = [
 '/!*! <%= pkg.title %> v<%= pkg.version %><%=ver%>',
 'by Zw UI Team',
 '(c) ' + $.util.date(Date.now(), 'UTC:yyyy') + ' AllMobilize, Inc.',
 'Licensed under <%= pkg.license %>',
 $.util.date(Date.now(), dateFormat) + ' *!/ \n'
 ].join(' | ');*/


function preparingData(){
    var jsEntry = '',
        plugins = _.union(config.js.base, fs.readdirSync('./js'));

    plugins.forEach(function(plugin, i){
        var basename = path.basename(plugin, '.js');

        if(basename !== 'zwui' && /\.js$/.test(plugin)){
            jsEntry += (basename === 'core' ? 'var UI = ' : '') +
                'require("./' + basename + '")\n';
        }
    });

    // end jsEntry
    jsEntry += '\nmodule.exports = $.ZWUI = UI;\n';
    fs.writeFileSync(path.join('./js/zwui.js'), jsEntry);
}

gulp.task("build:preparing", preparingData);


gulp.task("build:clean",function(cb){
    del([
        config.dist.js,
        config.dist.css,
        config.examples.css,
        config.examples.js
    ],cb);
});

gulp.task("build:js", function(cb){
    runSequence(
        'build:preparing',
        'build:pack:js',
        cb
    );
});

gulp.task("build:pack:js", function(){
    return browserify(
            './js/zwui.js',
            {debug: true}
        )
        .bundle()
        .on('error', function(err){
            console.log(err.message);
            this.emit('end');
        })
        .pipe(source('zwui.js'))
        .pipe(buffer())
        .pipe($.replace('{{VERSION}}', pkg.version))
        //.pipe($.header(banner, {pkg: pkg, ver: ''}))
        .pipe(gulp.dest(config.dist.js))
        .pipe($.uglify(config.uglify))
        //.pipe($.header(banner, {pkg: pkg, ver: ''}))
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(config.dist.js))
        .pipe(gulp.dest(config.examples.js))
        .pipe($.size({showFiles: true, title: 'minified'}))
        .pipe($.size({showFiles: true, gzip: true, title: 'gzipped'}));
});

gulp.task("build:less", function(){
    return gulp.src(config.path.less)
        .pipe($.plumber({errorHandler: function (err) {
            // 处理编译less错误提示  防止错误之后gulp任务直接中断
            // $.notify.onError({
            //           title:    "编译错误",
            //           message:  "错误信息: <%= error.message %>",
            //           sound:    "Bottle"
            //       })(err);
            console.log(err);
            this.emit('end');
        }}))
        .pipe($.less({
            paths: [
                path.join(__dirname, 'less')
                //path.join(__dirname, 'widget/*/src')
            ]
        }))
        /*        .pipe($.rename(function(path) {
         if (path.basename === 'zwui') {
         path.basename = pkg.name + '.basic';
         }
         }))*/
        .pipe($.autoprefixer({browsers: config.AUTOPREFIXER_BROWSERS}))
        //.pipe($.replace('//dn-amui.qbox.me/font-awesome/4.3.0/', '../'))
        .pipe(gulp.dest(config.dist.css))
        .pipe($.size({showFiles: true, title: 'source'}))
        // Disable advanced optimizations - selector & property merging, etc.
        // for Issue #19 https://github.com/allmobilize/amazeui/issues/19
        .pipe($.minifyCss({noAdvanced: true}))
        .pipe($.rename({
            suffix: '.min',
            extname: '.css'
        }))
        .pipe(gulp.dest(config.dist.css))
        .pipe(gulp.dest(config.examples.css))
        .pipe($.size({showFiles: true, title: 'minified'}))
        .pipe($.size({showFiles: true, gzip: true, title: 'gzipped'}));
});

gulp.task('build', function(cb){
    runSequence(
        'build:clean',
        ['build:less', 'build:js'],
        cb
    );
});

gulp.task('archive', function(cb){
    runSequence(
        'archive:clean',
        [
            'archive:copy:css',
            'archive:copy:js'
        ],
        cb
    );
});

gulp.task('archive:clean', function(cb){
    del(
        [config.examples.css, config.examples.js],
        cb
    );
});

gulp.task('archive:copy:css', function(){
    return gulp.src('./dist/css/*.css')
        .pipe(gulp.dest(config.examples.css));
});
gulp.task('archive:copy:js', function(){
    return gulp.src('./dist/js/*.js')
        .pipe(gulp.dest(config.examples.js));
});
gulp.task('archive:copy:vendor', function(){
    return gulp.src('./node_modules/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('./docs/examples/vendor'));
});


gulp.task('watch', function(){
    gulp.watch(['less/**/*.less'], ['build:less']);
    gulp.watch(['js/**/*.js'], ['build:js']);
    //gulp.watch(['docs/md/*.md'], ['convert']);
});


gulp.task('convert', function() {
    gulp.src('./docs/md/*.md')
        .pipe($.marked({
            // optional : marked options
        }))
        .pipe(gulp.dest('./docs/examples/'))
});

gulp.task('appServer',function(){
    var files = [
        './docs/examples/**/*.html',
        './docs/examples/assets',
    ];

    browersync.init(files, {
        server: {
            baseDir: './docs/examples'
        }
    });
});

gulp.task('default',['build', 'watch']);

gulp.task('preview',['build','archive:copy:vendor', 'watch', 'appServer']);