/**
 * Web Tls pages plugin
 * @module
 */
const Hoek = require('hoek');
const Package = require('package.json');
const WebTls = require('routes/web-tls');
const ViewsConfig = require('config-views');

const internals = {};
internals.after = function(server) {
    Hoek.assert(ViewsConfig.options.engines, 'views configuration not found');
    Hoek.assert(Array.isArray(WebTls.endpoints), 'webTls route configuration not found');

    internals.manager = server.views(ViewsConfig.options);
    Object.keys(ViewsConfig.helpers).forEach(helper => {
        internals.manager.registerHelper(helper, ViewsConfig.helpers[helper]);
    });
    server.route(WebTls.endpoints);
};

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 */
const register = function(server) {
    server.dependency('views', internals.after);
    server
        .logger()
        .child({ plugin: exports.plugin.name })
        .debug('started');
};

exports.plugin = {
    name: 'webTls',
    pkg: Package,
    register
};
