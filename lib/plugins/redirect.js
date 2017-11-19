/**
 * Redirect plugin
 * @module
 */
const Url = require('url');
const Package = require('../../package.json');
const Config = require('../config');

const internals = {
    web: {
        url: {
            protocol: 'http',
            slashes: true,
            hostname: Config.connections.web.host,
            port: Config.connections.web.port
        }
    },
    webTls: {
        url: {
            protocol: 'https',
            slashes: true,
            hostname: Config.connections.webTls.host,
            port: Config.connections.webTls.port
        }
    },
    api: {
        url: {
            protocol: 'https',
            slashes: true,
            hostname: Config.connections.api.host,
            port: Config.connections.api.port
        }
    }
};

internals.web.redirect = function(request, h) {

    if (request.url.path === '/') {
        return h.redirect(Url.format(internals.web.url) + Config.prefixes.home).permanent().takeover();
    }

    if (request.url.path === Config.prefixes.login) {
        return h.redirect(Url.format(internals.webTls.url) + request.url.path).permanent().takeover();
    }

    const tlsOnly = internals.options.tlsRoutes.some(path => {
        return request.url.path.startsWith(path);
    });

    return tlsOnly ? h.redirect(Url.format(internals.webTls.url) + request.url.path).permanent().takeover() : h.continue;
};

internals.webTls.redirect = function(request, h) {
    return request.url.path === '/' ? h.redirect(Url.format(internals.webTls.url) + Config.prefixes.home).permanent().takeover() : h.continue;
};

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 * @param {Object} options the plugin registration options
 */
const register = function(server, options) {

    const serverData = internals[server.settings.app.name];

    if (!serverData) {
        return;
    }

    // hook redirect into request lifecycle
    internals.options = options;
    if (serverData.redirect) {
        server.ext('onRequest', serverData.redirect);
    }

    // redirect wrong server api request to api server
    server.route({
        path: Config.prefixes.api + '/{path*}',
        method: '*',
        config: {
            auth: false,
            handler: (request, h) => {

                return h.redirect(Url.format(internals.api.url) + request.url.path).permanent();
            }
        }
    });
};

exports.plugin = {
    name: 'redirect',
    pkg: Package,
    register
};
