'use strict';

var config = require('12factor-config');

var cfg = config({
  awsAccessKeyId: {
    env: 'AWS_ACCESS_KEY_ID',
    required: true
  },
  awsDefaultRegion: {
    env: 'AWS_DEFAULT_REGION',
    required: true,
    default: 'us-west-2'
  },
  awsSecretAccessKey: {
    env: 'AWS_SECRET_ACCESS_KEY',
    required: true
  },
  s3BucketName: {
    env: 'S3_BUCKET_NAME',
    required: true,
    default: 'bridg-keen'
  },
  scClientId: {
    env: 'SOUNDCLOUD_CLIENT_ID',
    required: true
  },
  workerCount: {
    env: 'WORKER_COUNT',
    required: true,
    type: 'integer',
    default: 10
  }
});

module.exports = cfg;

