'use strict';

var config = require('12factor-config');

var cfg = config({
  scClientId: {
    env: 'SOUNDCLOUD_CLIENT_ID',
    required: true
  }
});

module.exports = cfg;

