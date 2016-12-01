'use strict';

var Config = require('../../config');
var Login = require('./login');
var Home = require('./home');
var Account = require('./account');
var Admin = require('./admin');

exports.endpoints = [

    { method: 'GET', path: Config.paths.login, config: Login.get },
    { method: 'GET', path: Config.paths.home, config: Home.get },
    { method: 'GET', path: Config.prefixes.account, config: Account.get },
    { method: 'GET', path: Config.prefixes.admin, config: Admin.get }

];
