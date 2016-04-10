'use strict';

var winston = require('winston');

var logger = null;

module.exports = function () {
  if (logger) {
    return logger;
  }

  logger = null;
  logger = new (winston.Logger)({
    transports: [
      new winston.transports.Console({timestamp: true})
    ]
  });

  logger.verboseLogger = new (winston.Logger)({
    transports: []
  });

  logger.verbose = function(message) {
    logger.verboseLogger.info(message);
  };

  return logger;
};
