'use strict';

var Config = require('../../config');
var Login = require('./login');
var Profile = require('./profile');

exports.endpoints = [

    { method: 'POST', path: Config.prefixes.login, config: Login.login },
    { method: 'GET', path: Config.prefixes.logout, config: Login.logout },
    { method: 'PUT', path: Config.prefixes.profile, config: Profile.update }

];
