/**
 * Web pages
 * @module
 */
const Hoek = require('hoek');
const Package = require('../../package.json');
const Web = require('../routes/web');
const ViewsConfig = require('../config/views');

const internals = {};
internals.after = function(server) {

    Hoek.assert(ViewsConfig.options.engines, 'views configuration not found');
    Hoek.assert(Array.isArray(Web.endpoints), 'web route configuration not found');

    server.views(ViewsConfig.manager);
    server.route(Web.endpoints);
};

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 */
const register = function(server) {
    server.dependency('views', internals.after);
};

exports.plugins = {
    name: 'web',
    pkg: Package,
    register
};
