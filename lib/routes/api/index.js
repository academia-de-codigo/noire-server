'use strict';

var Config = require('../../config');
var Version = require('./version');
var Login = require('./login');
var User = require('./user');
var Role = require('./role');

exports.endpoints = [

    { method: 'GET', path: '/version', config: Version.get },

    { method: 'POST', path: Config.paths.login, config: Login.login },
    { method: 'GET', path: Config.paths.logout, config: Login.logout },

    { method: 'GET', path: '/user', config: User.list },
    { method: 'GET', path: '/user/{id}', config: User.get },

    { method: 'GET', path: '/role', config: Role.list },
    { method: 'GET', path: '/role/{id}', config: Role.get },
    { method: 'POST', path: '/role', config: Role.create },
    { method: 'PUT', path: '/role/{id}', config: Role.update },
    { method: 'DELETE', path: '/role/{id}', config: Role.delete },
    { method: 'PUT', path: '/role/{id}/users', config: Role.addUser }

];
