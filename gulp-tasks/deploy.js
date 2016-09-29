'use strict';

var gulp = require('gulp');
var path = require('path');
var RSync = require('rsync');
var glob = require('globule');
var mkdirp = require('mkdirp');
var gutil = require('gulp-util');
var runSequence = require('run-sequence');

var EXCLUDE_FILE = './scratch/exclude.txt';
var DEVSITE = '';
var CITC_NAME = 'webfundamentals';

// var DEST_BASE = path.join('/google/src/cloud/', process.env.USER);
// DEST_BASE = path.join(DEST_BASE, CITC_NAME, '/google3/googledata/devsite/content');
var DEST_BASE = '/tmp/wf/';

gulp.task('deploy:stage', function(cb) {
  var copiesInProgress = 0;
  var langs = glob.find('*', [], {srcBase: './src/content/'});
  langs.forEach(function(lang) {
    gutil.log('Starting', 'Copying files to CitC', lang);
    var src = path.join('./src/content/', lang, '*');
    var dest = path.join(DEST_BASE, lang, '/web/');
    var rsync = new RSync()
      .delete()
      .archive()
      .set('exclude-from', EXCLUDE_FILE)
      .source(src)
      .destination(dest);
    mkdirp.sync(dest);
    copiesInProgress++;
    rsync.execute(function(error, code, cmd) {
      copiesInProgress--;
      if (code === 0) {
        gutil.log('Finished', 'Copying files to CitC', lang);
      }
      if (copiesInProgress === 0) {
        cb();
      }
    });
    
  });


  // console.log(langs);
});

gulp.task('deploy', function(cb) {
  runSequence(
    [
      'clean',
      'build',
      'test',
      'deploy:devsite'
    ], cb);
});
