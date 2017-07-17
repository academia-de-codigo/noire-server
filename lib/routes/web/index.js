var Config = require('../../config');
var Home = require('../../modules/home/routes/home');
var Login = require('../../modules/authorization/routes/web/login');
var Profile = require('../../modules/authorization/routes/web/profile');
var Admin = require('../../modules/authorization/routes/web/admin');

exports.endpoints = [

    { method: 'GET', path: Config.prefixes.login, config: Login.get },
    { method: 'GET', path: Config.prefixes.home, config: Home.get },
    { method: 'GET', path: Config.prefixes.profile, config: Profile.get },
    { method: 'GET', path: Config.prefixes.admin, config: Admin.get },
    { method: 'GET', path: Config.prefixes.admin + '/{partial}', config: Admin.get },
    { method: 'GET', path: Config.prefixes.admin + '/user/{id}', config: Admin.getUser },
    { method: 'GET', path: Config.prefixes.admin + '/role/{id}', config: Admin.getRole }
];
