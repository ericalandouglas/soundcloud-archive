'use strict';

var download = require('./lib/download');
var logger = require('./lib/logger.js')();

var standardCb = function (err, data) {
  if (err) {
    logger.error('error:', err);
  } else {
    logger.info("Archive available for dl at", data[3][1].Location);
  }
};

//download.getUserLikes('https://soundcloud.com/someked', standardCb);
//download.getPlaylist('https://soundcloud.com/sheltereddougie/sets/beat-culture', standardCb);

