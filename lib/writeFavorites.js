'use strict';

var fs = require('fs');
var async = require('async');
var R = require('ramda');
var request = require('request');

var CLIENT_ID = '4c06d988ab2fcf567ea586ae8bf9749e';

var getUserId = function (username, cb) {

  request('http://api.soundcloud.com/resolve?url=http://soundcloud.com/' + username + '&client_id=' + CLIENT_ID, function (err, res) {
    if (err) {
      cb(err);
    } else {
      cb(null, JSON.parse(res.toJSON().body).id);
    }
  });

};

var writeTrackUrls = function (tracksUrl, fp, allDone) {
  var urlWriter = fs.createWriteStream(fp);

  var writeMore = function (tracks, writeDone) {

    if (tracks.collection && R.isArrayLike(tracks.collection)) {
      async.each(tracks.collection, function (track, trackDone) {
        urlWriter.write(track.permalink_url + '\n', trackDone);
      },
      function (err) {
        writeDone(err);
      });
    }

  };

  var fetchMore = function (tracks, fetchDone) {

    if (tracks.next_href) {
      async.waterfall([
        function (cb) {
          request(tracks.next_href, cb);
        },
        function (res, cb) {
          res = JSON.parse(res.toJSON().body);
          fetchDone(null, res);
        }
      ],
      function (err) {
        fetchDone(err);
      });
    }

  };

  var tracksHandler = function (tracks) {

    async.parallel([
      function (cb) {
        writeMore(tracks, cb);
      },
      function (cb) {
        fetchMore(tracks, cb);
      }
    ],
    function (err, res) {
      if (err) {
        allDone(err);
      }

      tracks = res[1];
      if (tracks) {
        tracksHandler(tracks);
      } else {
        urlWriter.end();
        allDone(err);
      }
    });

  };

  request(tracksUrl, function (err, res) {
    if (err) {
      allDone(err);
    } else {
      tracksHandler(JSON.parse(res.toJSON().body));
    }
  });

};

module.exports = function (username, fp, cb) {

  async.waterfall([
    function (cb) {
      getUserId(username, cb);
    },
    function (userId, cb) {
      var tracksUrl = 'http://api.soundcloud.com/users/' + userId + '/favorites?client_id=' + CLIENT_ID + '&linked_partitioning=1';
      writeTrackUrls(tracksUrl, fp, cb);
    }
  ],
  function (err) {
    cb(err);
  });

};


