'use strict';

var fs = require('fs');
var async = require('async');
var R = require('ramda');
var request = require('request');
var config = require('./cfg.js');
var util = require('./util.js');

var getUserId = function (user, cb) {
  if (user.indexOf('http') < 0) { // if we get a username and not user url
    user = 'http://soundcloud.com/' + username;
  }
  request('http://api.soundcloud.com/resolve?url=' + user + '&client_id=' + config.scClientId, function (err, res) {
    if (err) {
      return cb(err);
    }
    cb(null, util.parseBody(res).id);
  });

};

var writeTrackUrls = function (tracksUrl, fp, allDone) {

  var fetchMore = function (tracks, fetchDone) {

    if (tracks.next_href) {
      return request(tracks.next_href, function (err, res) {
        fetchDone(err, util.parseBody(res));
      });
    }

    fetchDone();
  };

  var urlWriter = fs.createWriteStream(fp);
  var writeMore = function (tracks, writeDone) {

    if (tracks.collection && R.isArrayLike(tracks.collection)) {
      return async.each(tracks.collection, function (track, trackDone) {
        urlWriter.write(track.permalink_url + '\n', trackDone);
      }, writeDone);
    }

    writeDone();
  };

  var finish = function (e) { urlWriter.end(); allDone(e); };
  var tracksHandler = function (tracks) {

    async.parallel([
      function (cb) {
        fetchMore(tracks, cb);
      },
      function (cb) {
        writeMore(tracks, cb);
      }
    ],
    function (err, res) {
      if (err) {
        return finish(err);
      }

      tracks = res[0];
      if (tracks) {
        return tracksHandler(tracks);
      }
      finish(err);
    });

  };

  request(tracksUrl, function (err, res) {
    if (err) {
      return allDone(err);
    }
    tracksHandler(util.parseBody(res));
  });

};

module.exports = function (username, fp, done) {

  async.waterfall([
    function (cb) {
      getUserId(username, cb);
    },
    function (userId, cb) {
      var tracksUrl = 'http://api.soundcloud.com/users/' + userId + '/favorites?client_id=' + config.scClientId + '&linked_partitioning=1';
      writeTrackUrls(tracksUrl, fp, cb);
    }
  ], done);

};

