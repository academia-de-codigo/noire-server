/**
 * Web Tls pages
 * @module
 */
const Hoek = require('hoek');
const Package = require('../../package.json');
const WebTls = require('../routes/web-tls');
const ViewsConfig = require('../config/views');

const internals = {};
internals.after = function(server) {

    Hoek.assert(ViewsConfig.manager.engines, 'views configuration not found');
    Hoek.assert(Array.isArray(WebTls.endpoints), 'webTls route configuration not found');

    server.views(ViewsConfig.manager);
    server.route(WebTls.endpoints);
};

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 */
const register = function(server) {
    server.dependency('views', internals.after);
};

exports.register.attributes = {
    name: 'webTls',
    pkg: Package,
    register
};
