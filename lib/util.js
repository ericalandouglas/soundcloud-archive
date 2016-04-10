'use strict';

var fs = require('fs');
var R = require('ramda');
var logger = require('./logger.js')();

var parseBody = function (res) {
  return JSON.parse(res.toJSON().body)
};

var createRmFileFunc = function (fp) {
  return function (cb) {
    logger.info('Removing file at', fp);
    fs.unlink(fp, cb);
  }
};

var hasElements = function (xs) {
  return xs && R.isArrayLike(xs) && xs.length;
};

module.exports = {
  parseBody: parseBody,
  createRmFileFunc: createRmFileFunc,
  hasElements: hasElements
};

