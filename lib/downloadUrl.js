'use strict';

var fs = require('fs');
var fork = require('child_process').fork;
var async = require('async');
var R = require('ramda');
var config = require('./cfg.js');

var forkUrlDownloads = function (allUrls, destDir, cb) {

  var downloadUrl = function (url, urlDone) {
    var args = [url, '-x', '--audio-format', 'mp3', '-o', destDir + '/%(uploader)s_%(title)s.%(ext)s'];
    var worker = fork('./lib/youtubedl.js', args, { silent: true });
    var destPath = '';

    worker.stdout.on('data', function (data) {
      var output = data.toString();
      var regexp = /.*Destination: (.*)/;
      var match = regexp.exec(output);
      destPath = match[1];
    });
    worker.on('close', function (code) {
      urlDone(code);
    });
  };

  var downloadChunk = function (urls, chunkDone) {
    if (urls && R.isArrayLike(urls)) {
      return async.each(urls, downloadUrl, chunkDone);
    }
    chunkDone();
  };

  async.series(R.pipe(
    R.splitEvery(config.workerCount),
    R.map(function (urls) {
      return function (cb) {
        downloadChunk(urls, cb);
      };
    })
  )(allUrls), cb);
};

module.exports = function (urlfp, destDir, cb) {
  fs.readFile(urlfp, function (err, data) {
    if (err) {
      return cb(err);
    }

    var urls = data.toString().split('\n');
    urls = urls.slice(0, urls.length - 1);
    forkUrlDownloads(urls, destDir, cb);
  });
};

