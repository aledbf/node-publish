const assert = require('assert');
const pkg = require('../package.json');
const figaro = require('../index');

describe('publish', () => {

  before((done) => {
    // setup default npm using our start=> 
    // note: npm.load() only has an affect the first time it's called in a process
    figaro.start(null, (e) => {
      assert.ifError(e);
      done();
    });
  });

  describe('#shouldPublish', () => {
    it('should publish because local version is higher than remote version', () => {
      assert.ok(figaro.shouldPublish(null, '1.3.5', '1.3.4'));
    });
    it('should not publish because local version is equal to remote version', () => {
      assert.ok(!figaro.shouldPublish(null, '1.3.5', '1.3.5'));
    });
    it('should not publish because local version is lower than remote version', () => {
      assert.ok(!figaro.shouldPublish(null, '1.3.3', '1.3.5'));
    });
    it('should not publish because on-minor does not trigger on major changes', () => {
      assert.ok(!figaro.shouldPublish({
        'on-minor': true
      }, '2.3.3', '1.3.3'));
    });
    it('should not publish because on-minor does not on trigger major and patch changes', () => {
      assert.ok(!figaro.shouldPublish({
        'on-minor': true
      }, '2.3.5', '1.3.3'));
    });
    it('should publish because on-minor triggers on minor changes', () => {
      assert.ok(figaro.shouldPublish({
        'on-minor': true
      }, '2.3.3', '2.2.3'));
    });
    it('should publish because on-minor and on-patch triggers on minor changes', () => {
      assert.ok(figaro.shouldPublish({
        'on-minor': true,
        'on-patch': true
      }, '2.3.3', '2.2.3'));
    });
  });

  describe('#localPackage', () => {
    it('should report an error because it cannot find package.json', (done) => {
      figaro.localPackage((err) => {
        assert.ok(err);
        done();
      });
    });
  });

  describe('#remoteVersion', () => {
    it('should provide the remote version of this module', (done) => {
      figaro.remoteVersion(pkg, (err, remoteVersion) => {
        assert.ifError(err);
        assert.ok(remoteVersion);
        done();
      });
    });
    it('should report an error because module not found', (done) => {
      figaro.remoteVersion({
        'name': 'mysuperbogusnamethatcannotbefoundpublishedanywhere'
      }, (err, remoteVersion) => {
        assert.ok(err);
        done();
      });
    });
  });
});