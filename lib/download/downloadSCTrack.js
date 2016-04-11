'use strict';

var runYoutubedl = require('./youtubedl.js');

module.exports = function (worker, req, res) {
  var getSoundcloudFp = function (output) {
    var regexp = /.*Destination: (.*)/;
    var match = regexp.exec(output[5]);
    return match[1];
  };

  var args = ['-x', '--audio-format', 'mp3', '-o', req.query.dest + '/%(uploader)s_%(title)s.%(ext)s'];
  runYoutubedl(worker, res, req.query.url, args, getSoundcloudFp);
};

