'use strict';

var cluster = require('cluster');
var express = require('express');
var config = require('./config');
var download = require('./download');
var logger = require('./logger.js')();

var createWorker = function () {
  var worker = cluster.fork();
  worker.on('message', function (message) {
    logger.info('Master got message', message, 'from Worker', worker.process.pid);
  });

  worker.send('Master says thanks for starting');
  return worker;
};

var restartWorker = function (worker, code, signal) {
  logger.warn('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
  logger.info('Starting a new worker');
  var worker = createWorker();
};

var setUpCluster = function () {
  var workerCount = require('os').cpus().length;
  logger.info('Master setting up ' + workerCount + ' workers');
  for(var i = 0; i < workerCount; i++) {
    var worker = createWorker();
  }

  cluster.on('online', function(worker) {
    logger.info('Worker ' + worker.process.pid + ' is online');
  });
  cluster.on('exit', restartWorker);
};

var setUpWorker = function () {
  var worker = process;
  var app = express();

  worker.on('message', function (message) {
    logger.info('Master sent message to Worker', worker.pid + ':', message);
  });

  download.controller(app, worker);

  app.get('*', function (req, res) {
    res.sendStatus(404);
  });

  var server = app.listen(config.clusterPort, function() {
    logger.info('Worker ' + worker.pid + ' is listening to all incoming requests');
  });
};

module.exports = function () {
  if (cluster.isMaster) {
    setUpCluster(cluster);
  }
  else {
    setUpWorker();
  }
};

