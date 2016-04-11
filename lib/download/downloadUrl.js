'use strict';

var fs = require('fs');
var async = require('async');
var R = require('ramda');
var request = require('request');
var config = require('../config');
var logger = require('../logger.js')();
var util = require('../util.js');

var clusterUrlDownloads = function (allUrls, destDir, cb) {
  logger.info("Processing", allUrls.length, "total tracks");

  var downloadUrl = function (url, urlDone) {
    var opts = {
      url: 'http://localhost:' + config.clusterPort + '/soundcloud',
      qs: { url: url, dest: destDir },
      method: 'GET'
    };

    request(opts, function (error, response, body) {
      logger.info("Cluster download request complete, mp3 saved to", body);
      urlDone(error, body);
    });
  };

  var downloadChunk = function (urls, i, chunkDone) {
    if (util.hasElements(urls)) {
      logger.info("Downloading", urls.length, "more tracks");

      return async.each(urls, downloadUrl, function (err) {
        if (err) {
          logger.error("Chunk", i, "recevied an error while downloading:", err);
        }

        logger.info("Completed downloading chunk", i);
        chunkDone(err);
      });
    }

    logger.info("No more tracks to download in chunk", i);
    chunkDone();
  };

  var workerCount = require('os').cpus().length;
  var chunks = R.splitEvery(workerCount, allUrls);
  logger.info("Processing tracks in", chunks.length, "chunks");

  async.series(R.pipe(
    R.zip(R.range(0, chunks.length)),
    R.map(function (chunk) {
      var i = chunk[0] + 1;
      var urls = chunk[1];
      return function (cb) {
        downloadChunk(urls, i, cb);
      };
    })
  )(chunks), cb);
};

module.exports = function (urlfp, destDir, done) {
  logger.info("Downloading tracks in the download url file", urlfp, "and placing them in", destDir);

  var readFile = function (cb) {
    fs.readFile(urlfp, function (err, data) {
      if (err) {
        logger.error("Error reading track download urls file at", urlfp);
        return cb(err);
      }

      var urls = data.toString().split('\n');
      cb(null, urls.slice(0, urls.length - 1));
    });
  };

  async.waterfall([
    function (cb) {
      readFile(cb);
    },
    function (urls, cb) {
      if (util.hasElements(urls)) {
        return clusterUrlDownloads(urls, destDir, cb);
      }
      logger.info("No download urls to process in file at", urlfp);
      cb();
    }
  ], done);

};

