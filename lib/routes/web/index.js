'use strict';

var Config = require('../../config');
var Login = require('./login');
var Home = require('./home');
var Profile = require('./profile');
var Admin = require('./admin');

exports.endpoints = [

    { method: 'GET', path: Config.prefixes.login, config: Login.get },
    { method: 'GET', path: Config.prefixes.home, config: Home.get },
    { method: 'GET', path: Config.prefixes.profile, config: Profile.get },
    { method: 'GET', path: Config.prefixes.admin, config: Admin.get }

];
