'use strict';

var Config = require('../../config');
var Version = require('./version');
var Login = require('./login');
var Profile = require('./profile');
var User = require('./user');
var Role = require('./role');

exports.endpoints = [

    { method: 'GET', path: '/version', config: Version.get },

    { method: 'POST', path: Config.prefixes.login, config: Login.login },
    { method: 'GET', path: Config.prefixes.logout, config: Login.logout },

    { method: 'GET', path: '/profile', config: Profile.get },
    { method: 'PUT', path: '/profile', config: Profile.update },

    { method: 'GET', path: '/user', config: User.list },
    { method: 'GET', path: '/user/{id}', config: User.get },
    { method: 'POST', path: '/user', config: User.create },
    { method: 'PUT', path: '/user/{id}', config: User.update },
    { method: 'DELETE', path: '/user/{id}', config: User.delete},

    { method: 'GET', path: '/role', config: Role.list },
    { method: 'GET', path: '/role/{id}', config: Role.get },
    { method: 'POST', path: '/role', config: Role.create },
    { method: 'PUT', path: '/role/{id}', config: Role.update },
    { method: 'DELETE', path: '/role/{id}', config: Role.delete },
    { method: 'PUT', path: '/role/{id}/users', config: Role.addUser },
    { method: 'DELETE', path: '/role/{id}/users', config: Role.removeUser },
    { method: 'PUT', path: '/role/{id}/permissions', config: Role.addPermission },
    { method: 'DELETE', path: '/role/{id}/permissions', config: Role.removePermission }

];
