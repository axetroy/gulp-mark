/**
 * Created by axetroy on 16-9-22.
 */

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var stream = require('stream');
var _ = require('lodash');

// 常量
const PLUGIN_NAME = 'gulp-marker';

class markerTransform extends stream.Transform {
  constructor(env) {
    super();
    this.devReg = /\/\/\s*@dev\b/g;
    this.prodReg = /\/\/\s*@prod\b/g;
    this.endReg = /\/\/\s*@end\b/g;
    this.startReg = env === 'prod' ? this.devReg : this.prodReg;
  }

  _transform(chunk, encoding, callback) {
    let data = chunk.toString();

    let dataLines = data.split(/\n/g);

    let range = [];
    let starts = [];

    /**
     * 逐行分析代码
     * 最后得出一个数组，里面记录了从xx行-xx行为标记代码
     */
    _.each(dataLines, (lineCode, lineIndex)=> {
      // find the start marker
      if (this.startReg.test(lineCode)) {
        starts.push({
          line: lineIndex + 1,
          code: lineCode
        });
      }
      // match the start marker with end
      else if (this.endReg.test(lineCode)) {
        if (starts.length) {
          let lastStart = starts.pop();
          range.push({
            start: lastStart.line,
            end: lineIndex + 1
          });
        }
      }

    });

    let result = _.cloneDeep(dataLines);

    _.each(range, range=> {
      _.each(dataLines, (lineCode, lineIndex)=> {
        let line = lineIndex + 1;
        if (line > range.start && line < range.end) {
          result[lineIndex] = {origin: lineCode};
        }
      });
    });

    _.each(result, (lineCode, lineIndex)=> {
      if (_.isPlainObject(lineCode)) {
        result[lineIndex] = `// ${lineCode.origin}`;
      }
    });

    result = result.join('\n');

    this.push(new Buffer(result));
    callback(null);
  }
}

/**
 * remove the marker code
 * @param env  {string}
 * @returns {*}
 */
function marker(env) {
  return through.obj(function (file, enc, cb) {
    if (file.isBuffer()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));
      return cb();
    }

    if (file.isStream()) {
      if (!env || (env !== 'prod' && env !== 'dev')) {
        return this.emit('error', new PluginError(PLUGIN_NAME, 'Invalid env!'));
      }
      var streamer = new markerTransform(env);
      streamer.on('error', this.emit.bind(this, 'error'));
      file.contents = file.contents.pipe(streamer);
    }

    this.push(file);
    cb();
  });
}

marker.transform = markerTransform;

module.exports = marker;