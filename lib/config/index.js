'use strict';

var config = require('12factor-config');
var options = require('./env.options.js');

module.exports = config(options);

