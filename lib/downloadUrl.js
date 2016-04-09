'use strict';

var fs = require('fs');
var async = require('async');
var youtubedl = require('youtube-dl');

module.exports = function (urlfp, destDir, cb) {
  fs.readFile(urlfp, function (err, data) {
    if (err) {
      cb(err);
    }

    else {
      var urls = data.toString().split('\n');
      urls = urls.slice(0, urls.length - 1);
      var args = ['-x', '--audio-format', 'mp3', '-o', destDir + '/%(uploader)s_%(title)s.%(ext)s'];

      async.each(urls, function (url, urlDone) {
        youtubedl.exec(url, args, {}, function (err, output) {
          console.log(output.join('\n'));
          urlDone(err);
        });
      }, cb);

    }
  });
};

