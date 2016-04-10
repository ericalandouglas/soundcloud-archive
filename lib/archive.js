'use strict';

var fs = require('fs');
var async = require('async');
var archiver = require('archiver');
var AWS = require('aws-sdk');
var config = require('./config');
var logger = require('./logger.js')();
var util = require('./util.js');

AWS.config.update({
  accessKeyId: config.awsAccessKeyId,
  secretAccessKey: config.awsSecretAccessKey,
  region: config.awsDefaultRegion
});

var archive = archiver('zip');
var createArchive = function (source, dest, archiveDone) {
  logger.info("Creating archive of directory", source, "at", dest);
  var output = fs.createWriteStream(dest);

  archive.directory(source, true, { date: new Date() });
  archive.pipe(output);
  archive.finalize();

  archive.on('error', function (err) {
    logger.error("Archiver received an error:", err);
    return archiveDone(err);
  });
  output.on('close', function () {
    logger.info("Completed archive creation");
    archiveDone();
  });
};

var uploadArchiveToS3 = function (source, keyName, uploadDone) {
  logger.info("Uploading archive at", source, "to S3 in bucket", config.s3BucketName, "at key", keyName);

  var uploadZip = function (archiveStream, s3Done) {
    var opts = {
      Bucket: config.s3BucketName,
      Key: keyName,
      ACL: 'public-read'
    };
    var s3obj = new AWS.S3({ params: opts });
    var s3upload = s3obj.upload({ Body: archiveStream })

    var currProg = 0;
    s3upload.on('httpUploadProgress', function(evt) {
      var thisProg = Math.floor(evt.loaded * 100 / evt.total);
      if (thisProg > currProg) {
        currProg = thisProg;

        if (currProg % 5 === 0) {
          logger.info("Progress:", currProg + ".0%, part:", evt.part);
        }
      }
    });

    s3upload.send(s3Done);
  };

  uploadZip(fs.createReadStream(source), function (err, res) {
    logger.info("S3 upload complete");
    uploadDone(err, res);
  });
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

