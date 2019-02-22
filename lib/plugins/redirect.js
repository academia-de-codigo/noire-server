/**
 * URL Redirection plugin
 * @module
 */
const Url = require('url');
const Hoek = require('hoek');
const Package = require('package.json');
const Config = require('lib/config');

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
    // redirect root to /home
    if (request.path === '/') {
        return h
            .redirect(Url.format(internals.web.url) + Config.prefixes.home)
            .permanent()
            .takeover();
    }

    // these pages contain user passwords, make sure they are not sent in clear text,
    // even if not present in Config.redirect.tlsOnly
    if (request.path === Config.prefixes.login || request.path === Config.prefixes.register) {
        return h
            .redirect(Url.format(internals.webTls.url) + request.path)
            .permanent()
            .takeover();
    }

    // redirect all Config.redirect.tlsOnly to https
    const tlsOnly = internals.options.tlsRoutes.some(path => {
        return request.path.startsWith(path);
    });

    return tlsOnly
        ? h
              .redirect(Url.format(internals.webTls.url) + request.path)
              .permanent()
              .takeover()
        : h.continue;
};

internals.webTls.redirect = function(request, h) {
    // redirect root to home
    return request.path === '/'
        ? h
              .redirect(Url.format(internals.webTls.url) + Config.prefixes.home)
              .permanent()
              .takeover()
        : h.continue;
};

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 * @param {Object} options the plugin registration options
 */
const register = function(server, options) {
    Hoek.assert(options.tlsRoutes, 'Redirect plugin missing tlsRoutes option');

    const serverData = internals[server.settings.app.name];

    if (!serverData || !Config.connections[server.settings.app.name].enabled) {
        return;
    }

    // hook defined redirects into request lifecycle
    internals.options = options;
    if (serverData.redirect) {
        server.ext('onRequest', serverData.redirect);
    }

    // redirect wrong server api request to api server
    //TODO: should we not exclude this for the API server???
    server.route({
        path: Config.prefixes.api + '/{path*}',
        method: '*',
        config: {
            auth: false,
            handler: (request, h) => {
                return h.redirect(Url.format(internals.api.url) + request.path).permanent();
            }
        }
    });

    server
        .logger()
        .child({ plugin: exports.plugin.name })
        .debug('started');
};

exports.plugin = {
    name: 'redirect',
    pkg: Package,
    register
};
