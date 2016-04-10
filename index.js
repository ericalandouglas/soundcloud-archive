'use strict';

var download = require('./lib/download.js');

var standardCb = function (err) {
  if (err) {
    console.log(err)
    console.log('error');
  } else {
    console.log('success')
  }
};

download.getUserLikes('https://soundcloud.com/edouglastest', __dirname + '/playlist_test', standardCb);

