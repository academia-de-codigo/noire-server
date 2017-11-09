/**
 * Support for server side rendered views using handlebars templates
 * @module
 */
const Vision = require('vision');
const Path = require('path');
const Package = require('../../package.json');
const ViewsConfig = require('../config/views');

const internals = {};
internals.addToContext = function(response, data, name) {
    response.source.context = response.source.context || {};
    response.source.context[name] = data;
};

// insert logged in user data into every view context
internals.injectCredentials = function(request, h) {

    const response = request.response;

    // not a view response, continue processing
    if (!response.variety || response.variety !== 'view') {
        return h.continue;
    }

    const credentials = request.auth.isAuthenticated ? request.auth.credentials : null;
    internals.addToContext(response, credentials, ViewsConfig.context.variables.CREDENTIALS);
    return h.continue;
};

// insert page name into every view context
internals.injectPageName = function(request, h) {

    const response = request.response;

    // not a view response, continue processing
    if (!response.variety || response.variety !== 'view') {
        return h.continue;
    }

    const pageName = Path.basename(response.source.template);
    internals.addToContext(response, pageName, ViewsConfig.context.variables.VIEW);

    return h.continue;
};

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 */
const register = async function(server) {

    await server.register(Vision);

    // insert credentials and page name in every view context
    server.ext('onPreResponse', internals.injectCredentials);
    server.ext('onPreResponse', internals.injectPageName);
};

exports.plugin = {
    register: register,
    name: 'views',
    pkg: Package
};
