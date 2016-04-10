'use strict';

var fs = require('fs');
var fork = require('child_process').fork;
var async = require('async');
var R = require('ramda');
var config = require('../config');
var logger = require('../logger.js')();
var util = require('../util.js');

var forkUrlDownloads = function (allUrls, destDir, cb) {
  logger.info("Processing", allUrls.length, "total tracks");

  var downloadUrl = function (url, urlDone) {
    var args = [url, '-x', '--audio-format', 'mp3', '-o', destDir + '/%(uploader)s_%(title)s.%(ext)s'];
    var worker = fork('./lib/download/youtubedl.js', args, { silent: true });
    var destPath = '';

    worker.stdout.on('data', function (data) {
      var output = data.toString();
      var regexp = /.*Destination: (.*)/;
      var match = regexp.exec(output);
      destPath = match[1];
    });

    worker.on('close', urlDone);
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

  var chunks = R.splitEvery(config.workerCount, allUrls);
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

module.exports = function (urlfp, destDir, cb) {
  logger.info("Downloading tracks in the download url file", urlfp, "and placing them in", destDir);

  fs.readFile(urlfp, function (err, data) {
    if (err) {
      logger.error("Error reading track download urls file at", urlfp);
      return cb(err);
    }

    var urls = data.toString().split('\n');
    urls = urls.slice(0, urls.length - 1);

    if (util.hasElements(urls)) {
      return forkUrlDownloads(urls, destDir, cb);
    }

    logger.info("No download urls to process in file at", urlfp);
    cb();
  });
};

