'use strict';

var config = require('12factor-config');

var cfg = config({
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

