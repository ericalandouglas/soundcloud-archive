'use strict';

var fs = require('fs');
var async = require('async');
var R = require('ramda');
var request = require('request');
var config = require('./cfg.js');
var util = require('./util.js');

var getUserId = function (username, cb) {

  request('http://api.soundcloud.com/resolve?url=http://soundcloud.com/' + username + '&client_id=' + config.clientId, function (err, res) {
    if (err) {
      cb(err);
    } else {
      cb(null, util.parseBody(res).id);
    }
  });

};

var writeTrackUrls = function (tracksUrl, fp, allDone) {

  var urlWriter = fs.createWriteStream(fp);
  var writeMore = function (tracks, writeDone) {

    if (tracks.collection && R.isArrayLike(tracks.collection)) {
      async.each(tracks.collection, function (track, trackDone) {
        urlWriter.write(track.permalink_url + '\n', function (err, res) {
          trackDone(err, res);
        });
      }, writeDone);
    }

    else {
      writeDone();
    }

  };

  var fetchMore = function (tracks, fetchDone) {

    if (tracks.next_href) {
      request(tracks.next_href, function (err, res) {
        fetchDone(err, util.parseBody(res));
      });
    } else {
      fetchDone();
    }

  };

  var tracksHandler = function (tracks) {

    async.parallel([
      function (cb) {
        writeMore(tracks, function (err) {
          cb(err);
        });
      },
      function (cb) {
        fetchMore(tracks, function (err, res) {
          cb(err, res);
        });
      }
    ],
    function (err, res) {
      var finish = function (e) { urlWriter.end(); allDone(e); };
      if (err) {
        finish(err);
      }

      tracks = res[1];
      if (tracks) {
        tracksHandler(tracks);
      } else {
        finish(err);
      }
    });

  };

  request(tracksUrl, function (err, res) {
    if (err) {
      allDone(err);
    } else {
      tracksHandler(util.parseBody(res));
    }
  });

};

module.exports = function (username, fp, done) {

  async.waterfall([
    function (cb) {
      getUserId(username, function (err, id) {
        cb(err, id);
      });
    },
    function (userId, cb) {
      var tracksUrl = 'http://api.soundcloud.com/users/' + userId + '/favorites?client_id=' + config.clientId + '&linked_partitioning=1';
      writeTrackUrls(tracksUrl, fp, function (err) {
        cb(err);
      });
    }
  ], done);

};

