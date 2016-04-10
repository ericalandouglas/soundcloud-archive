'use strict';

var fs = require('fs');
var async = require('async');
var R = require('ramda');
var request = require('request');
var config = require('../config');
var logger = require('../logger.js')();
var util = require('../util.js');

var getUserId = function (userUrl, cb) {
  logger.info('Requesting user id for url', userUrl);

  request('http://api.soundcloud.com/resolve?url=' + userUrl + '&client_id=' + config.scClientId, function (err, res) {
    if (err) {
      logger.error('getUserId got an error:', err);
      return cb(err);
    }
    var userId = util.parseBody(res).id;
    logger.info('Got user id:', userId);
    cb(null, userId);
  });

};

var writeTrackUrls = function (tracksUrl, fp, allDone) {
  var urlWriter;

  var fetchMore = function (tracks, fetchDone) {

    if (tracks.next_href) {
      logger.info('Fetching more tracks at', tracks.next_href);

      return request(tracks.next_href, function (err, res) {
        fetchDone(err, util.parseBody(res));
      });
    }

    logger.info("No more tracks to fetch");
    fetchDone();
  };


  var writeMore = function (tracks, writeDone) {

    if (util.hasElements(tracks.collection)) {
      logger.info("Writing", tracks.collection.length, "more track download urls")

      return async.each(tracks.collection, function (track, trackDone) {
        urlWriter.write(track.permalink_url + '\n', trackDone);
      }, writeDone);
    }

    logger.info("No more track download urls to write");
    writeDone();
  };

  var finish = function (e) {
    logger.info("Completed writing all track download urls");
    urlWriter.end();
    allDone(e);
  };

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
        logger.error("The tracksHandler encountered an error:", err);
        return finish(err);
      }

      tracks = res[0];
      if (tracks) {
        logger.info("Track data still exists, handling");
        return tracksHandler(tracks);
      }
      finish(err);
    });

  };

  logger.info("Beginning track data request at", tracksUrl);
  request(tracksUrl, function (err, res) {
    if (err) {
      logger.error("Error making request for track data:", err);
      return allDone(err);
    }

    logger.info("Writing track download urls to", fp);
    urlWriter = fs.createWriteStream(fp);

    tracksHandler(util.parseBody(res));
  });

};

module.exports = function (userUrl, fp, done) {

  async.waterfall([
    function (cb) {
      getUserId(userUrl, cb);
    },
    function (userId, cb) {
      var tracksUrl = 'http://api.soundcloud.com/users/' + userId + '/favorites?client_id=' + config.scClientId + '&linked_partitioning=1';
      writeTrackUrls(tracksUrl, fp, cb);
    }
  ], done);

};

