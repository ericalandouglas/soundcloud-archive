'use strict';

var fs = require('fs');
var async = require('async');
var archiveDir = require('./archive.js');
var downloadUrls = require('./downloadUrl.js');
var writeFavorites = require('./writeFavorites.js');
var writePlaylist = require('./writePlaylist.js');

var getUserLikes = function (username, dest, done) {
  var tempFn = 'myfavs.txt';

  async.series([
    function (cb) {
      writeFavorites(username, tempFn, cb);
    },
    function (cb) {
      downloadUrls(tempFn, dest, cb);
    },
    function (cb) {
      fs.unlink(tempFn, cb);
    },
    function (cb) {
      archiveDir(dest, dest + '.zip', cb);
    }
  ], done);

};

module.exports = {
  getUserLikes: getUserLikes
};


//writePlaylist('https://soundcloud.com/sheltereddougie/sets/beat-culture', 'myplaylist.txt', standardCb);


