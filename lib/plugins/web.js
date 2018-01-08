/**
 * Web pages plugin
 * @module
 */
const Path = require('path');
const Hoek = require('hoek');
const Package = require(Path.join(process.cwd(), 'package.json'));
const Web = require(Path.join(process.cwd(), 'lib/routes/web'));
const ViewsConfig = require(Path.join(process.cwd(), 'lib/config/views'));

const internals = {};
internals.after = function(server) {

    Hoek.assert(ViewsConfig.options.engines, 'views configuration not found');
    Hoek.assert(Array.isArray(Web.endpoints), 'web route configuration not found');

    server.views(ViewsConfig.options);
    server.route(Web.endpoints);
};

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 */
const register = function(server) {
    server.dependency('views', internals.after);
};

exports.plugin = {
    name: 'web',
    pkg: Package,
    register
};
