/**
 * Route errors plugin
 * @module
 */
const Boom = require('boom');
const Joi = require('joi');
const Package = require('../../package.json');

/**
 * Plugin registration function
 *
 * @param {Hapi.Server} server the hapi server
 */
const register = function(server) {

    // handle invalid route attempts
    server.ext('onPreResponse', (request, h) => {

        const response = request.response;

        // request hits an invalid route
        if (response.isBoom && response.output.statusCode === 404) {

            // we need to explicitely test for the redirect property to be false,
            // as an undefined value means that we can redirect
            if (request.route.settings.app.redirect === false) {

                // we can not redirect, most likely an invalid asset request,
                // continue processing to send 404 back to requester
                return h.continue;
            }

            // we can redirect to root
            return h.redirect(request.url).permanent();
        }

        // not an invalid route, continue processing
        return h.continue;
    });

    // handle route errors
    server.ext('onPreResponse', (request, h) => {

        if (request.response.isBoom) {

            // log error message
            request.log(['debug', 'route'], request.response.message);

            // handle joi validation failures
            if (request.response.output.statusCode === 400) {

                // replace joi detailed error message with something simpler
                return Boom.badRequest('Malformed Data Entered');
            }

            // we need to explicitely test for redirect property to be false,
            // as an undefined value means that we can redirect
            if (request.route.settings.app.redirect === false) {

                // we can not redirect, continue processing
                return h.continue;
            }

            // if insufficient scope redirect home
            var schema = Joi.string().regex(/^Insufficient scope/);
            var result = Joi.validate(request.response.message, schema);
            if (result.error === null) {

                // insufficient scope, redirect to root
                return h.redirect(request.url);
            }
        }

        // no route error, continue processing
        return h.continue;
    });
};

exports.plugin = {
    register: register,
    name: 'route-errors',
    pkg: Package
};
