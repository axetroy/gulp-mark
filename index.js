/**
 * Created by axetroy on 16-9-22.
 */

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var stream = require('stream');
var _ = require('lodash');

const PLUGIN_NAME = 'gulp-mark';
const REG = {
  dev: /\/\/\s*@dev\b/g,
  prod: /\/\/\s*@prod\b/g,
  end: /\/\/\s*@end\b/g
};

/**
 * pick the star mark reg
 * @param env
 * @returns {RegExp}
 */
function pickReg(env) {
  return env === 'prod' ? REG.dev : REG.prod;
}

/**
 * parser file string
 * @param fileStr
 * @param starMarkReg
 * @returns {string[]|Array|LoDashImplicitArrayWrapper<string>|LoDashExplicitArrayWrapper<string>|*}
 */
function parser(fileStr, starMarkReg) {
  let dataLines = fileStr.split(/\n/g);

  let range = [];
  let starts = [];

  /**
   * 逐行分析代码
   * 最后得出一个数组，里面记录了从xx行-xx行为标记代码
   */
  _.each(dataLines, (lineCode, lineIndex)=> {
    // find the start marker
    if (starMarkReg.test(lineCode)) {
      starts.push({
        line: lineIndex + 1,
        code: lineCode
      });
    }
    // match the start marker with end
    else if (REG.end.test(lineCode)) {
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

  /**
   * 标记要注释的代码
   */
  _.each(range, range=> {
    _.each(dataLines, (lineCode, lineIndex)=> {
      let line = lineIndex + 1;
      if (line > range.start && line < range.end) {
        result[lineIndex] = {origin: lineCode};
      }
    });
  });

  /**
   * 注释已标记的代码
   */
  _.each(result, (lineCode, lineIndex)=> {
    if (_.isPlainObject(lineCode)) {
      result[lineIndex] = `// ${lineCode.origin}`;
    }
  });

  // 最终结果
  result = result.join('\n');

  return result;
}

class markerTransform extends stream.Transform {
  constructor(env) {
    super();
    this.env = env;
  }

  _transform(chunk, encoding, callback) {
    let data = chunk.toString();
    const result = parser.call(this, data, pickReg(this.env));
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
      let fileStr = file.contents.toString();
      fileStr = parser.call(this, fileStr, pickReg(env));
      file.contents = new Buffer(fileStr);
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
marker.parser = parser;
marker.pickReg = pickReg;

module.exports = marker;