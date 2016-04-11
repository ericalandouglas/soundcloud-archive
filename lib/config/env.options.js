'use strict';

module.exports = {
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
  clusterPort: {
    env: 'ARCHIVE_CLUSTER_PORT',
    required: true,
    type: 'integer',
    default: 8000
  },
  s3BucketName: {
    env: 'S3_BUCKET_NAME',
    required: true,
    default: 'soundcloud-archive'
  },
  scClientId: {
    env: 'SOUNDCLOUD_CLIENT_ID',
    required: true
  }
};

