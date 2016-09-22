/**
 * Created by axetroy on 16-9-22.
 */

var gulp = require('gulp');
var marker = require('./index');

gulp.task('default', function () {
  return gulp.src('./demo/basic.js', {buffer: false})
    .pipe(marker('prod'))
    .pipe(gulp.dest('./dist'));
});
