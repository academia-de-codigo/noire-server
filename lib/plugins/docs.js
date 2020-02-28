/**
 * Documentation plugin, works as a wrapper around lout
 * @module
 */
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Swagger = require('hapi-swagger');
const Package = require('package.json');
const Config = require('config');

/**
 * Options configuration for Swagger
 */
const options = {
    host: `${Config.api.host}:${Config.api.port}`,
    jsonPath: '/api-spec.json',
    info: {
        title: 'Noire Server Api Documentation',
        version: Package.version
    },
    grouping: 'tags',
    definitionPrefix: 'useLabel',
    sortEndpoints: 'method',
    documentationPath: '/docs'
};

/**
 * Plugin registration function
 * @async
 * @param {Hapi.Server} server the hapi server
 */
const register = async function(server) {
    if (Config.environment === 'production') {
        return;
    }

    await server.register([
        Inert,
        Vision,
        {
            plugin: Swagger,
            options
        }
    ]);

    server
        .logger()
        .child({ plugin: exports.plugin.name })
        .debug('plugin');
};

exports.plugin = {
    name: 'docs',
    pkg: Package,
    register
};
