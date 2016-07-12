'use strict';
/* ---------- */
/* setup */
var gulp = require('gulp');
var rename = require('gulp-rename');
var del = require('del');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var strip = require('gulp-strip-code');
/* ---------- */
/* linting */
gulp.task('lint', function() {
    gulp.src([
        'src/mark.src.js'
    ])
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    ;
});
/* ---------- */
/* build */
gulp.task('build-version', function() {
    // clear dist
    del.sync('./dist/*', {force: true});
    // copy files to dist
    gulp.src(['src/mark.src.js'])
    .pipe(strip({
        //jscs:disable
        start_comment: 'start-testing',
        end_comment: 'end-testing'
        //jscs:enable
    }))
    .pipe(rename('mark.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(jshint())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'))
    // remove umd
    .on('end', function() {
        del.sync('./src/sortable-elements.js', {force: true});
    });
});
/* ---------- */
/* tasks */
gulp.task('test', ['lint']);
gulp.task('build', [
    // 'build-version',
    'test'
]);

gulp.task('gulp', ['test']);
