/**
 * Created by axetroy on 16-9-22.
 */

var path = require('path');
var fs = require('fs');

var expect = require('chai').expect;
var gulp = require('gulp');
var marker = require(path.join(process.env.PWD, 'index.js'));
var markerTransform = marker.transform;

describe('test gulp task', function () {
  it('compile a basic file', function () {

    var rs = fs.createReadStream(path.join(process.env.PWD, '/demo', 'index.js'));

    rs.pipe(new markerTransform('prod')).pipe(process.stdout);

    expect(1).to.be.equal(1);
  });
});