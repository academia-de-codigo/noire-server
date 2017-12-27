/**
 * Api plugin
 * @module
 */
const Path = require('path');
const Package = require(Path.join(process.cwd(), 'package.json'));
const Api = require(Path.join(process.cwd(), 'lib/routes/api'));

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 */
const register = function(server) {
    server.route(Api.endpoints);
};

exports.plugin = {
    name: 'api',
    pkg: Package,
    register
};
