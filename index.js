'use strict';

require('babel-register')({
    presets: ['es2015']
});
// Load ENV vars from .env
require('dotenv').config();
require('./src/server');
