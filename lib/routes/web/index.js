const Config = require('config');
const Home = require('modules/home/routes/web/home');

exports.endpoints = [{ method: 'GET', path: Config.prefixes.home, config: Home.get }];
