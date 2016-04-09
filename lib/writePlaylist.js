'use strict';

var fs = require('fs');
var async = require('async');
var request = require('request');

var CLIENT_ID = '4c06d988ab2fcf567ea586ae8bf9749e';

module.exports = function (playlistUrl, fp, cb) {

  request('http://api.soundcloud.com/resolve?url=' + playlistUrl + '&client_id=' + CLIENT_ID, function (err, res) {
    if (err) {
      cb(err);
    }

    else {
      var urlWriter = fs.createWriteStream(fp);
      var body = JSON.parse(res.toJSON().body);

      async.each(body.tracks, function (track, trackDone) {
        urlWriter.write(track.permalink_url + '\n', trackDone);
      },
      function (err) {
        urlWriter.end();
        cb(err);
      });

    }
  });

};

