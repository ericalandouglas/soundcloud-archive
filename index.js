'use strict';

var async = require('async');
var request = require('request');
var writeFavorites = require('./lib/writeFavorites.js');
var writePlaylist = require('./lib/writePlaylist.js');
var downloadUrls = require('./lib/downloadUrl.js');

var standardCb = function (err) {
  if (err) {
    console.log(err)
  } else {
    console.log('success')
  }
};

//downloadUrls('myplaylist.txt', __dirname + '/playlist_test', standardCb);
//writeFavorites('sheltereddougie', 'myfavs.txt', standardCb);
//writePlaylist('https://soundcloud.com/sheltereddougie/sets/beat-culture', 'myplaylist.txt', standardCb);

