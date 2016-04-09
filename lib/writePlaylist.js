'use strict';

var fs = require('fs');
var async = require('async');
var request = require('request');
var config = require('./cfg.js');

module.exports = function (playlistUrl, fp, cb) {

  request('http://api.soundcloud.com/resolve?url=' + playlistUrl + '&client_id=' + config.clientId, function (err, res) {
    if (err) {
      cb(err);
    }

    else {
      var urlWriter = fs.createWriteStream(fp);
      var body = JSON.parse(res.toJSON().body);

      async.each(body.tracks, function (track, trackDone) {
        urlWriter.write(track.permalink_url + '\n', function (err, res) {
          trackDone(err, res);
        });
      },
      function (err) {
        urlWriter.end();
        cb(err);
      });

    }
  });

};

