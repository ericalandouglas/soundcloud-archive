'use strict';

var createFavorites = require('./writeFavorites.js');
var createPlaylist = require('./writePlaylist.js');

module.exports = {
  createFavorites: createFavorites,
  createPlaylist: createPlaylist
};

