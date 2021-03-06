var gulp = require('gulp');
//var gutil = require('gulp-util');
//var bower = require('bower');
var ngAnnotate = require('gulp-ng-annotate');
var ngmin = require('gulp-ngmin');
var stripDebug = require('gulp-strip-debug');
var concat = require('gulp-concat');
//var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
//var sh = require('shelljs');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var paths = {
  sass: ['./scss/**/*.scss']
};



gulp.task('default', ['jshint'], function() {
    gulp.start('minifyjs');
});

//压缩，合并 js
gulp.task('minifyjs',function() {
  return gulp.src('./www/js/**/*.js')      //需要操作的文件
    .pipe(concat('main.js'))    //合并所有js到main.js
    .pipe(gulp.dest('./www/dist'))       //输出到文件夹
    .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
    .pipe(ngAnnotate())
    .pipe(ngmin({dynamic: false}))
    .pipe(stripDebug())
    .pipe(uglify({outSourceMap: false}))    //压缩
    .pipe(gulp.dest('./www/dist'));  //输出
});

gulp.task('jshint', function () {
  return gulp.src('./www/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

/*gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});*/
