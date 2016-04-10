'use strict';

var async = require('async');
var R = require('ramda');
var rmdir = require('rimraf');
var archiveDir = require('./archive.js');
var downloadUrls = require('./downloadUrl.js');
var util = require('./util.js');
var writeFavorites = require('./writeFavorites.js');
var writePlaylist = require('./writePlaylist.js');

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
      rmdir(dest, cb);
    }
  ], dlDone);

};

var getUserLikes = function (userUrl, done) {
  var username = R.last(userUrl.split('/'));
  var tempFn = username + '_temp_favs.txt'
  var tempDest = __dirname + '/' + username + '_favs';

  var createFile = function (cb) {
    writeFavorites(userUrl, tempFn, cb);
  };
  downloadTrackFile(tempFn, tempDest, createFile, done);
};

var getPlaylist = function (playlistUrl, done) {
  var setname = R.last(playlistUrl.split('/'));
  var tempFn = setname + '_temp_playlist.txt'
  var tempDest = __dirname + '/' + setname + '_favs';

  var createFile = function (cb) {
    writePlaylist(playlistUrl, tempFn, cb);
  };
  downloadTrackFile(tempFn, tempDest, createFile, done);
};

module.exports = {
  getUserLikes: getUserLikes,
  getPlaylist: getPlaylist
};

