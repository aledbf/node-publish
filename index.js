const npm = require('npm');
const semver = require('semver');
const fs = require('fs');
const log = require('npmlog');
log.heading = 'publish';

exports.start = (tagName, callback) => {
  let loadOptions = {};
  if (tagName) {
    log.info('Using tag', tagName);
    loadOptions.tag = tagName;
  }

  npm.load(loadOptions, (err) => {
    callback(err, npm);
  });
};

const readLocalPackage = (callback) => {
  try {
    callback(null, JSON.parse(fs.readFileSync('./package.json')));
  } catch (err) {
    callback(err);
  }
}
exports.localPackage = readLocalPackage;

function remoteVersion(localPackage, callback) {
  npm.commands.view([localPackage.name, 'version'], true, (err, message) => {
    if (err) {
      if (err.code === 'E404') {
        return callback('You have not published yet your first version of this module: publish will do nothing\n' +
          'You must publish manually the first release of your module');
      }

      return callback(err);
    }

    let version = false;
    for (let key in message) {
      if (key) {
        version = key;
        break;
      }
    }

    if (version) {
      return callback(null, version);
    }

    return callback('No version of this package has yet been published for tag "' + npm.config.get('tag') + '".\n' +
      'You must publish manually the first release of your module');
  });
}
exports.remoteVersion = remoteVersion;

exports.publish = (options, callback) => {
  readLocalPackage((err, pkg) => {
    if (err) {
      callback('publish can only be performed from the root of npm modules (where the package.json resides)');
    } else {
      let localVersion = pkg.version;
      if (localVersion == null) {
        return callback('you have not defined a version in your npm module, check your package.json');
      }

      remoteVersion(pkg, (err, remote) => {
        if (err) {
          return callback(err);
        }

        if (!shouldPublish(options, localVersion, remote)) {
          if (options.test) {
            process.exit(1);
          }
        } else {
          if (!options.test) {
            npmPublish(callback);
          }
        }
      });
    }
  });
};

const npmPublish = (callback) => {
  npm.commands.publish([], false, (err, message) => {
    if (err) {
      log.error('publish failed:', message);
      return callback(err);
    }

    log.info('published ok');
    return callback();
  });
}

const shouldPublish = (options, local, remote) => {
  options = options || {};

  log.info('Local version: ' + local);
  log.info('Published version: ' + remote);
  if (semver.eq(remote, local)) {
    log.info('Your local version is the same as your published version: publish will do nothing');
    return false;
  } else if (semver.gt(remote, local)) {
    log.warn('Your local version is smaller than your published version: publish will do nothing');
    return false;
  } else if (containsOnVersion(options)) {
    let diff = semver.diff(remote, local);
    if (!options['on-' + diff]) {
      log.info('Your local version does not satisfy your --on-[major|minor|patch|build] options; publish will do nothing');
      return false;
    }
  }

  log.info('Defined criteria met; publish will release a new version');
  return true;
}
exports.shouldPublish = shouldPublish;

const containsOnVersion = (options) => {
  return options['on-major'] || options['on-minor'] || options['on-patch'] || options['on-build'];
}