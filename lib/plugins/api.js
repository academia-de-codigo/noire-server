/**
 * Api plugin
 * @module
 */
const Package = require('package.json');
const Api = require('routes');

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 */
const register = function(server) {
    server.route(Api.endpoints);

    server
        .logger()
        .child({ plugin: exports.plugin.name })
        .debug('plugin');
};

exports.plugin = {
    name: 'api',
    pkg: Package,
    register
};
