'use strict';

var fs = require('fs');
var async = require('async');
var archiver = require('archiver');
var archive = archiver('zip');
var AWS = require('aws-sdk');
var config = require('./cfg.js');
var util = require('./util.js');

AWS.config.update({
  accessKeyId: config.awsAccessKeyId,
  secretAccessKey: config.awsSecretAccessKey,
  region: config.awsDefaultRegion
});

var s3 = new AWS.S3();

var createArchive = function (source, dest, archiveDone) {
  var output = fs.createWriteStream(dest);

  archive.directory(source, true, { date: new Date() });
  archive.pipe(output);
  archive.finalize();

  archive.on('error', archiveDone);
  output.on('close', archiveDone);
};

var uploadArchiveToS3 = function (source, keyName, uploadDone) {
  var uploadZip = function (archiveStream, s3Done) {
    var opts = {
      Bucket: config.s3BucketName,
      Key: keyName,
      ACL: 'public-read'
    };
    var s3obj = new AWS.S3({ params: opts });
    s3obj.upload({ Body: archiveStream }).send(s3Done);
  };

  async.waterfall([
    function (cb) {
      var archiveStream = fs.createReadStream(source);
      cb(null, archiveStream);
    },
    uploadZip
  ], uploadDone);
};

module.exports = function (source, keyName, cb) {
  var tempZip = source + '.zip';

  async.series([
    function (cb) {
      createArchive(source, tempZip, cb);
    },
    function (cb) {
      uploadArchiveToS3(tempZip, keyName, cb);
    },
    util.createRmFileFunc(tempZip)
  ], cb);
};

