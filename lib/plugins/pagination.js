/**
 * Api pagination plugin
 * @module
 */
const Pagination = require('hapi-pagination');
const Package = require('package.json');
const Config = require('lib/config');

const internals = {};
internals.options = {
    query: {
        limit: {
            name: 'limit',
            default: 25
        },
        pagination: {
            name: 'pagination',
            default: true,
            active: true
        }
    },
    meta: {
        location: 'header'
    },
    routes: Config.pagination
};

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 */
const register = async function(server) {
    // register the hapi-pagination plugin
    await server.register({ plugin: Pagination, options: internals.options });

    server
        .logger()
        .child({ plugin: exports.plugin.name })
        .debug('started');
};

exports.plugin = {
    name: 'pagination',
    pkg: Package,
    register
};
