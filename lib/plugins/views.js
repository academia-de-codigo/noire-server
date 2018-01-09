/**
 * Plugin for server side rendered views using handlebars templates
 * @module
 */
const Vision = require('vision');
const Path = require('path');
const Package = require(Path.join(process.cwd(), 'package.json'));
const ViewsConfig = require(Path.join(process.cwd(), 'lib/config/views'));

const internals = {};

// gets user credentials from request object
internals.getUserCredentials = request => request.auth.isAuthenticated ? request.auth.credentials : null;

// gets view name from request object
internals.getPageName = request => Path.basename(request.response.source.template);

// decorates the view context with additional properties to be exposed as handlebars identifiers
internals.decorateViewContext = function(request) {

    const response = request.response;
    response.source.context = response.source.context || {};
    const context = response.source.context;

    context[ViewsConfig.contextVariables.VERSION] = Package.version;
    context[ViewsConfig.contextVariables.CREDENTIALS] = internals.getUserCredentials(request);
    context[ViewsConfig.contextVariables.VIEW] = internals.getPageName(request);
};

// inject view properites in the view context
internals.injectProperties = function(request, h) {

    const response = request.response;

    // not a view response, continue processing
    if (response.variety !== 'view') {
        return h.continue;
    }

    internals.decorateViewContext(request);
    return h.continue;
};

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 */
const register = async function(server) {

    // register the vision view template manager
    await server.register(Vision);

    // insert addiotnal properties in every view context
    server.ext('onPreResponse', internals.injectProperties);

    server.logger().child({ plugin: exports.plugin.name }).debug('started');
};

exports.plugin = {
    name: 'views',
    pkg: Package,
    register
};
