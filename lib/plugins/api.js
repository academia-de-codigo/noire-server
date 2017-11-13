/**
 * Api plugin
 * @module
 */
const Package = require('../../package.json');
const Api = require('../routes/api');

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
