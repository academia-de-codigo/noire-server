var Config = require('../../config');
var Login = require('./login');
var Profile = require('./profile');
var User = require('./user');
var Role = require('./role');

exports.endpoints = [

    { method: 'POST', path: Config.prefixes.login, config: Login.login },
    { method: 'GET', path: Config.prefixes.logout, config: Login.logout },
    { method: 'PUT', path: Config.prefixes.profile, config: Profile.update },
    { method: 'PUT', path: Config.prefixes.user, config: User.update},
    { method: 'GET', path: Config.prefixes.user, config: User.get},
    { method: 'DELETE', path: Config.prefixes.user, config: User.delete},
    { method: 'GET', path: Config.prefixes.role, config: Role.get},
    { method: 'DELETE', path: Config.prefixes.role, config: Role.delete}

];
