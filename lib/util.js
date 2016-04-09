'use strict';

var parseBody = function (res) { return JSON.parse(res.toJSON().body) };

module.exports = {
  parseBody: parseBody
};

