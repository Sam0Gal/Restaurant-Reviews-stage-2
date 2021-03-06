/**
 * Copy files and folders.
 * ---------------------------------------------------------------
 *
 * # dev task config
 * Copies modulesToCopy array content
 * Copies all directories and files, except sass files, from the sails
 * assets folder into the .tmp/public directory.
 *
 * # build task config
 * Copies modulesToCopy array content
 * Copies all directories nd files from the .tmp/public directory into a www directory.
 */

module.exports = function(gulp, plugins, growl) {
  var runSequence = require('run-sequence');

  gulp.task('copy:dev', function() {
    require('../pipeline').modulesToCopy.forEach(function(module) {
      gulp.src(module.src).pipe(gulp.dest('.tmp/public/' + module.dest));
    });

    return gulp.src(['./assets/**/*.!(scss)', '!assets/images{,/**}'])
      .pipe(gulp.dest('.tmp/public'))
      .pipe(plugins.if(growl, plugins.notify({ message: 'Copy dev task complete' })));
  });

  gulp.task('copy:build', function() {
    // gulp.src(['assets/*.html'])
      // .pipe(plugins.gzip({gzipOptions: {level: 9}}))
      // .pipe(gulp.dest('.tmp/public'));
    return gulp.src(['./assets/**!(js)/*.!(scss)', '!assets/images{,/**}', 'assets/*.html', 'assets/sw.js'])
    .pipe(gulp.dest('.tmp/public'));
  });
  gulp.task('copy:watch', function() {
        gulp.src(['assets/*.html', 'assets/sw.js'])
          .pipe(gulp.dest('.tmp/public'));
        return plugins.browserSync.reload;
  })
};
