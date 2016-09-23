/**
 * Created by axetroy on 16-9-22.
 */

var path = require('path');
var fs = require('fs');

var es = require('event-stream');
var File = require('vinyl');
var expect = require('chai').expect;
var gulp = require('gulp');
var marker = require(path.join(process.env.PWD, 'index.js'));

describe('test gulp task', function () {
  it('compile a basic file', function () {

    var fakeFile = new File({
      contents: es.readArray(['stream', 'with', 'those', 'contents'])
    });

    // process.stdout.pipe(fakeFile);

    fakeFile.on('data', function (data) {
      console.log(data);
    });

    // fakeFile.pipe(process.stdout)


    /*    fakeFile
     .pipe(marker('dev'))
     .on('data', function (file, content) {
     console.log(222, file, content);
     });*/

  });
});
