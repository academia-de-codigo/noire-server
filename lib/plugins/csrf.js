/**
 * Plugin to secure web/web-tls routes against CSRF
 * @module
 */
const Crumb = require('crumb');
const Package = require('package.json');

const internals = {};
internals.crumbRoute = {
    method: 'GET',
    path: '/generate',
    config: {
        auth: false,
        description: 'Get crumb to start session',
        handler: request => ({ crumb: request.plugins.crumb })
    }
};

/**
 * Plugin registration function
 * @async
 * @param {Hapi.Server} server the hapi server
 */
const register = async function(server) {
    const config = {
        restful: true, // all POST, PUT, DELETE, OR PATCH requests require a valid crumb to be loaded in headers
        cookieOptions: {
            isSecure: true // cookie is not allowed to be transmitted over insecure connections
        }
    };

    await server.register({
        plugin: Crumb,
        options: config
    });

    if (server.settings.app && server.settings.app.name === 'api') {
        // route returning a valid crumb for api requests
        server.route(internals.crumbRoute);
    }

    server
        .logger()
        .child({ plugin: exports.plugin.name })
        .debug('started');
};

exports.plugin = {
    name: 'csrf',
    pkg: Package,
    register
};
