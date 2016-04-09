'use strict';

var fs = require('fs');
var async = require('async');
var request = require('request');
var config = require('./cfg.js');
var util = require('./util.js');

module.exports = function (playlistUrl, fp, done) {

  request('http://api.soundcloud.com/resolve?url=' + playlistUrl + '&client_id=' + config.clientId, function (err, res) {
    if (err) {
      done(err);
    }

    else {
      var urlWriter = fs.createWriteStream(fp);
      var body = util.parseBody(res);

      async.each(body.tracks, function (track, trackDone) {
        urlWriter.write(track.permalink_url + '\n', function (err, res) {
          trackDone(err, res);
        });
      },
      function (err) {
        urlWriter.end();
        done(err);
      });

    }
  });

};

