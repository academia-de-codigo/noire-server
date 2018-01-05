const Path = require('path');
const Config = require(Path.join(process.cwd(), 'lib/config'));
const Home = require(Path.join(process.cwd(), 'lib/modules/home/routes/web/home'));

exports.endpoints = [

    { method: 'GET', path: Config.prefixes.home, config: Home.get }

];
