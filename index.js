'use strict';

var download = require('./lib/download.js');

var archiveDir = require('./lib/archive.js');

var standardCb = function (err, data) {
  if (err) {
    console.log(err)
    console.log('error');
  } else {
    console.log(data[3][1].Location);
    console.log('success');
  }
};

download.getUserLikes('https://soundcloud.com/kyle-savidge-1', standardCb);
//download.getPlaylist('https://soundcloud.com/edouglastest/sets/test_playlist', standardCb);


