'use strict';

var fs = require('fs');
var archiver = require('archiver');
var archive = archiver('zip');

module.exports = function (source, dest, archiveDone) {
  var output = fs.createWriteStream(dest);

  archive.directory(source, true, { date: new Date() });
  archive.pipe(output);
  archive.finalize();

  archive.on('error', archiveDone);
  output.on('close', archiveDone);
};

