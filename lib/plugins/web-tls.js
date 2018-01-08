/**
 * Web Tls pages plugin
 * @module
 */
const Hoek = require('hoek');
const Path = require('path');
const Package = require(Path.join(process.cwd(), 'package.json'));
const WebTls = require(Path.join(process.cwd(), 'lib/routes/web-tls'));
const ViewsConfig = require(Path.join(process.cwd(), 'lib/config/views'));

const internals = {};
internals.after = function(server) {

    Hoek.assert(ViewsConfig.options.engines, 'views configuration not found');
    Hoek.assert(Array.isArray(WebTls.endpoints), 'webTls route configuration not found');

    server.views(ViewsConfig.options);
    server.route(WebTls.endpoints);
};

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 */
const register = function(server) {
    server.dependency('views', internals.after);
};

exports.plugin = {
    name: 'webTls',
    pkg: Package,
    register
};
