'use strict';

var runYoutubedl = require('./youtubedl.js');
var util = require('../util.js');

module.exports = function (worker, req, res) {
  var getSoundcloudFp = function (output) {
    var regexp = /.*file (.*) exists.*/;
    var match = regexp.exec(output[7]);
    return util.hasElements(match) ? match[1] : '??';
  };

  var args = ['-x', '--audio-format', 'mp3', '-o', req.query.dest + '/%(uploader)s_%(title)s.%(ext)s'];
  runYoutubedl(worker, res, req.query.url, args, getSoundcloudFp);
};

