'use strict';

var youtubedl = require('youtube-dl');
var logger = require('../logger.js')();

module.exports = function (worker, res, url, args, processOutput) {
  youtubedl.exec(url, args, {}, function (err, output) {
    worker.send('Worker ' + worker.pid + ' finished downloading ' + url);
    if (err) {
      logger.error('youtube-dl encountered an error:', err);
      return res.sendStatus(500);
    }

    res.setHeader('Content-Type', 'text/plain');
    res.send(processOutput(output));
  });

};

