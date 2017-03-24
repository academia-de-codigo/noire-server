var Config = require('../../config');
var Login = require('./login');

exports.endpoints = [

    { method: 'POST', path: Config.prefixes.login, config: Login.login },
    { method: 'GET', path: Config.prefixes.logout, config: Login.logout }

];
