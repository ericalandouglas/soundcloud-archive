'use strict';

var downloadSCTrack = require('./downloadSCTrack.js');
var downloadTracks = require('./downloadTracks.js');
var logger = require('../logger.js')();

var addTracksRoute = function (app, path, getTracksFunc) {

  app.get(path, function (req, res) {
    getTracksFunc(req.query.url, function (err, trackRes) {
      if (err) {
        logger.error(path, 'encountered an error:', err);
        return res.sendStatus(500);
      }

      logger.info("Downloaded tracks at source", req.query.url, "uploaded to", trackRes[3][1].Location);
      res.setHeader('Content-Type', 'text/plain');
      res.send("Archive available for dl at " + trackRes[3][1].Location);
    });
  });

};

module.exports = function (app, worker) {

  app.get('/soundcloud', function (req, res) {
    downloadSCTrack(worker, req, res);
  });

  addTracksRoute(app, '/favorites', downloadTracks.getUserLikes);
  addTracksRoute(app, '/playlist', downloadTracks.getPlaylist);
};

