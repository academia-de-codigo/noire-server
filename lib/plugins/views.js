var Package = require('../../package.json');
var ViewsConfig = require('../config/views');
var Vision = require('vision');
var Path = require('path');

var internals = {};

internals.injectCredentials = function(request, reply) {

    // insert logged in user data into every view context
    var response, credentials;
    response = request.response;

    // dont mess with responses that don't include a view
    if (!response.variety || response.variety !== 'view') {
        return reply.continue();
    }

    credentials = request.auth.isAuthenticated ? request.auth.credentials : null;
    addToContext(request, credentials, ViewsConfig.context.variables.CREDENTIALS);

    return reply.continue();
};

internals.injectPageName = function(request, reply) {

    // insert page name into every context
    var response, template;
    response = request.response;

    // dont mess with responses that don't include a view
    if (!response.variety || response.variety !== 'view') {
        return reply.continue();
    }

    template = request.response.source.template;
    template = Path.basename(template);
    addToContext(request, template, ViewsConfig.context.variables.PAGE_NAME);

    return reply.continue();
};

exports.register = function(server, options, next) {

    server.register(Vision, function(err) {

        if (err) {
            return next(err);
        }

        // include credentials and page name in every context
        server.ext('onPreResponse', internals.injectCredentials);
        server.ext('onPreResponse', internals.injectPageName);

        return next();
    });
};

/**
 * Adds data to the template context, making it accessible using {{ name }}
 * @param {Object}      request     Hapi request Object
 * @param {Anything}    data        Data to store in the templates' context
 * @param {String}      name        Identifier used to store the data. throws error if it's not unique
 */
function addToContext(request, data, name) {

    var response = request.response;

    response.source.context = response.source.context || {};
    response.source.context[name] = data;
}

exports.register.attributes = {
    name: 'views',
    pkg: Package
};
