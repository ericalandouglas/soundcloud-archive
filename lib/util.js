'use strict';

var fs = require('fs');

var parseBody = function (res) {
  return JSON.parse(res.toJSON().body)
};

var createRmFileFunc = function (fp) {
  return function (cb) {
    fs.unlink(fp, cb);
  }
};

module.exports = {
  parseBody: parseBody,
  createRmFileFunc: createRmFileFunc
};

