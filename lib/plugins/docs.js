/**
 * Documentation plugin, works as a wrapper around lout
 * @module
 */
const Path = require('path');
const Lout = require('lout');
const Inert = require('inert');
const Vision = require('vision');
const Package = require(Path.join(process.cwd(), 'package.json'));

/**
 * Plugin registration function
 * @async
 * @param {Hapi.Server} server the hapi server
 */
const register = async function(server) {

    await server.register([Inert, Vision, {
        plugin: Lout,
        options: {
            apiVersion: Package.version
        }
    }]);

    server.logger().child({ plugin: exports.plugin.name }).debug('started');
};

exports.plugin = {
    name: 'docs',
    pkg: Package,
    register
};
