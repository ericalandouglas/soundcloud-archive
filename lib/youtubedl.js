'use strict';

var youtubedl = require('youtube-dl');

var url = process.argv[2];
var args = process.argv.slice(3);

youtubedl.exec(url, args, {}, function (err, output) {
  console.log(output[5]);
  return 0;
});

