const Path = require('path');
const Config = require(Path.join(process.cwd(), 'lib/config'));
const Login = require(Path.join(process.cwd(), 'lib/modules/authorization/routes/web-tls/login'));
const Home = require(Path.join(process.cwd(), 'lib/modules/home/routes/web-tls/home'));

exports.endpoints = [

    { method: 'GET', path: Config.prefixes.home, config: Home.get },
    { method: 'GET', path: Config.prefixes.login, config: Login.get },
    { method: 'POST', path: Config.prefixes.login, config: Login.login },
    { method: 'GET', path: Config.prefixes.logout, config: Login.logout }

];
