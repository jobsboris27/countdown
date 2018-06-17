const gulp = require('gulp');
const less = require('gulp-less');
const path = require('path');
const uglify = require('gulp-uglify-es').default;
const rename = require("gulp-rename");
const autoprefixer = require('gulp-autoprefixer');
const watch = require('gulp-watch');

gulp.task('lessToCss', function () {
  return gulp.src('./style/style.less')
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./style/'));
});

gulp.task('compressJs', function (cb) {
  return gulp.src("./src/countdown.js")
        .pipe(rename("countdown.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("./src"));
});

gulp.task('default', function() {  
  gulp.run('lessToCss', 'compressJs');
});

gulp.task('watch', function() {
  gulp.watch('./style/style.less', ['lessToCss']);
  gulp.watch('./src/countdown.js', ['compressJs']);
});


