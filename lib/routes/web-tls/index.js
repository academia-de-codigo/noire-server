const Config = require('config');
const Login = require('modules/authorization/routes/web-tls/login');
const Home = require('modules/home/routes/web-tls/home');

exports.endpoints = [
    { method: 'GET', path: Config.prefixes.home, config: Home.get },
    { method: 'GET', path: Config.prefixes.login, config: Login.get },
    { method: 'POST', path: Config.prefixes.login, config: Login.login },
    { method: 'GET', path: Config.prefixes.logout, config: Login.logout }
];
