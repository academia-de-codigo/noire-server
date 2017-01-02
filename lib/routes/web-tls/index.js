'use strict';

var Config = require('../../config');
var Login = require('./login');

exports.endpoints = [

    { method: 'POST', path: Config.paths.login, config: Login.login },
    { method: 'GET', path: Config.paths.logout, config: Login.logout }

];
