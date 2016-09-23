/**
 * Created by axetroy on 16-9-22.
 */
const path = require('path');
var expect = require('chai').expect;
var marker = require(path.join(process.env.PWD, 'index.js'));
var parser = marker.parser;
const _ = require('lodash');

describe('parse basic file string', function () {
  let fileStr = '';

  beforeEach(function () {
    fileStr = `
2.console.log('this is normal code');

// @dev

6.console.log('this is dev code');
7.console.log('this is dev code');
8.console.log('this is dev code');

// @end

12.console.log('this is spe for dev and prod');

// @prod

16.console.log('this is prod code and just write prod code here');

// @end

 `;
  });

  it('one note line must be annotated @prod', function () {
    let afterParser = parser(fileStr, marker.pickReg('dev'));
    let allLine = afterParser.split(/\n/g);
    let noteLine = [allLine[15], allLine[17], allLine[17]];
    expect(_.every(noteLine, v=>/^\/\//.test(v))).to.be.equal(true);
  });

  it('multi line must be annotated @dev', function () {
    let afterParser = parser(fileStr, marker.pickReg('prod'));
    let allLine = afterParser.split(/\n/g);
    let noteLine = [allLine[5], allLine[6], allLine[7], allLine[8], allLine[9]];
    expect(_.every(noteLine, v=>/^\/\//.test(v))).to.be.equal(true);
  });

  it('after parse, the content\'s length will not change', function () {
    let originLength = fileStr.split(/\n/g).length;
    let parserLength = parser(fileStr, marker.pickReg('prod')).split(/\n/g).length;
    expect(originLength).to.be.equal(parserLength);
  })

});

describe('parse file string without end mark', function () {
  let fileStr = '';
  beforeEach(function () {
    fileStr = `
 1. console.log('normal code');

 // @dev

 5. console.log('normal code');

 // @prod

 9. console.log('hello world');
 `;
  });
  it('after parse,the content will no change any thing', function () {
    let parseStr = parser(fileStr, marker.pickReg('dev'));
    expect(parseStr).to.be.equal(fileStr);
  });
});

describe('parse file string without start mark', function () {
  let fileStr = '';
  beforeEach(function () {
    fileStr = `
 1. console.log('normal code');

 // @end

 5. console.log('normal code');

 // @prod

 9. console.log('hello world');
 `;
  });
  it('after parse,the content will no change any thing', function () {
    let parseStr = parser(fileStr, marker.pickReg('prod'));
    expect(parseStr).to.be.equal(fileStr);
  });
});

describe('parse nest mark', function () {
  let fileStr = '';
  beforeEach(function () {
    fileStr = `
console.log('normal code');

// @dev

    console.log('invalid dev code and it will not be annotated');

    // @prod
    
    console.log('prod code');
    
    // @end

// @end

console.log('normal code end');
`;
  });
  it('in dev env, will only annotated the @prod code range', function () {
    let parseLine = parser(fileStr, marker.pickReg('dev')).split(/\n/g);
    // console.log(parseLine);
    let likeExpect = true;

    _.each(parseLine, function (lineCode, index) {
      let codeLine = index + 1;
      if ([9, 10, 11].includes(codeLine)) {
        if (/^\/\//.test(lineCode) === false) {
          likeExpect = false;
        }
      } else {
        /*if (/^\/\//.test(lineCode)) {
         likeExpect = false;
         }*/
      }
    });
    expect(likeExpect).to.be.equal(true);
  });
});