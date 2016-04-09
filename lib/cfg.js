'use strict';

var config = require('12factor-config');

var cfg = config({
  clientId: {
    env: 'CLIENT_ID',
    required: true
  }
});

module.exports = cfg;

