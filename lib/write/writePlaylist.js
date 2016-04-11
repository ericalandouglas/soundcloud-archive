'use strict';

var fs = require('fs');
var async = require('async');
var request = require('request');
var logger = require('../logger.js')();
var util = require('../util.js');

module.exports = function (playlistUrl, fp, done) {

  logger.info("Beginning track data request at", playlistUrl);
  request(util.createResolveUrl(playlistUrl), function (err, res) {
    if (err) {
      logger.error("Received an error trying to resolve playlist url:", err);
      done(err);
    }

    else {
      logger.info("Writing track download urls to", fp);
      var urlWriter = fs.createWriteStream(fp);
      var body = util.parseBody(res);

      logger.info("Playlist has", body.tracks.length, "tracks");
      async.each(body.tracks, function (track, trackDone) {
        urlWriter.write(track.permalink_url + '\n', trackDone);
      },
      function (err) {
        logger.info("Completed writing all track download urls");
        urlWriter.end();
        done(err);
      });

    }
  });

};

