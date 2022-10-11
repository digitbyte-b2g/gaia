'use strict';

var utils = require('./utils');
var RE_JSON = /\.json$/;

exports.execute = function(options) {
  var jsons = [];
  var dirs = ['webapps', 'dev_webapps', 'build', 'customize', 'dev_webapps',
    'locales', 'shared'];

  dirs.forEach(function(dir) {
    var dirFile = utils.getFile(options.GAIA_DIR, dir);
    var files = utils.ls(dirFile, true).filter(function(f) {
      return RE_JSON.test(f.leafName);
    });
    jsons.push(...files);
  });

  jsons.forEach(function(json) {
    try {
      JSON.parse(utils.getFileContent(json));
    } catch (e) {
      utils.log('jsonlint', 'JSON lint error: ' + json.path + '\n');
      throw e;
    }
  });
};
