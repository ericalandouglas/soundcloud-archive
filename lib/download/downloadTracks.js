'use strict';

var async = require('async');
var R = require('ramda');
var rmdir = require('rimraf');
var archiveDir = require('../archive.js');
var downloadUrls = require('./downloadUrl.js');
var logger = require('../logger.js')();
var util = require('../util.js');
var write = require('../write');

var downloadTrackFile = function (trackFn, dest, createFile, dlDone) {

  async.series([
    createFile,
    function (cb) {
      downloadUrls(trackFn, dest, cb);
    },
    util.createRmFileFunc(trackFn),
    function (cb) {
      var keyName = R.last(dest.split('/')) + '.zip';
      archiveDir(dest, keyName, cb);
    },
    function (cb) {
      logger.info('Removing directory', dest);
      rmdir(dest, cb);
    }
  ], dlDone);

};

var createTempPaths = function (url, trackType) {
  var path = R.last(url.split('/')) + '_' + trackType;
  return {
    fn: path + '.txt',
    dest: path
  };
};

var getTracksFactory = function (writeFunction, trackType) {

  return function (url, done) {
    logger.info("Beginning", trackType, "download process using url", url);

    var temp = createTempPaths(url, trackType);
    var createFile = function (cb) {
      logger.info("Creating track download urls file at", temp.fn);
      writeFunction(url, temp.fn, cb);
    };
    downloadTrackFile(temp.fn, temp.dest, createFile, done);
  }
}

module.exports = {
  getUserLikes: getTracksFactory(write.createFavorites, "favs"),
  getPlaylist: getTracksFactory(write.createPlaylist, "set"),
};

