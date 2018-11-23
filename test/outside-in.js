const assert = require('assert');
const path = require('path');
const spawn = require('child_process').spawn;

describe('publish', () => {
  var script = path.resolve(__dirname, '..', 'bin', 'publish.js');
  var opts = {
    cwd: path.resolve(__dirname, '..')
  };
  describe('#publishTag', () => {
    it('should use the default config value when not provided', (done) => {
      var testTagDefault = spawn(script, ['--test'], opts),
        output = '';
      testTagDefault.stderr.on('data', (data) => {
        output += data;
      });
      testTagDefault.on('close', (code) => {
        assert.ok(!output.includes('Using tag'), 'The output included "Using tag":\n' + output);
        //assert.ifError(code, 'Unexpected error code: ' + code);
        done();
      });
    });
    it('should set the tag provided', (done) => {
      var testTagSet = spawn(script, ['--test', '--tag', 'foo'], opts),
        output = '';
      testTagSet.stderr.on('data', (data) => {
        output += data;
      });
      testTagSet.on('close', (code) => {
        assert.ok(output.includes('Using tag foo'), 'The output did not include "Using tag foo":\n' + output);
        assert.ok(code, 'Unexpected error code: ' + code);
        done();
      });
    });
  });
});

// older versions of node did not support String.includes(), Polyfill from MDN:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes#Polyfill
if (!String.prototype.includes) {
  String.prototype.includes = (search, start) => {
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    }

    return this.indexOf(search, start) !== -1;
  };
}