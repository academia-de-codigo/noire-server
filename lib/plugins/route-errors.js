/**
 * Route errors plugin
 * @module
 */
const Boom = require('boom');
const Joi = require('joi');
const Path = require('path');
const Package = require(Path.join(process.cwd(), 'package.json'));

/**
 * Plugin registration function
 * @async
 * @param {Hapi.Server} server the hapi server
 */
const register = function(server) {

    // handle invalid route attempts
    server.ext('onPreResponse', (request, h) => {

        const response = request.response;

        // not an invalid route, continue processing
        if (!response.isBoom || response.output.statusCode !== 404) {
            return h.continue;
        }

        // we need to explicitely test for the redirect property to be false,
        // as an undefined value means that we can redirect
        if (request.route.settings.app.redirect === false) {

            // we can not redirect, most likely an invalid asset request,
            // continue processing to send 404 back to requester
            return h.continue;
        }

        // we can redirect to root
        return h.redirect('/').permanent();
    });

    // handle route errors
    server.ext('onPreResponse', (request, h) => {

        const response = request.response;

        // not a route error, continue processing
        if (!response.isBoom) {
            return h.continue;
        }

        // log error message
        request.log(['debug', 'route'], response.message);

        // handle joi validation failures
        if (response.output.statusCode === 400) {

            // replace joi detailed error message with something simpler
            return Boom.badRequest('Malformed Data Entered');
        }

        // we need to explicitely test for redirect property to be false,
        // as an undefined value means that we can redirect
        if (request.route.settings.app.redirect === false) {

            // we can not redirect, continue processing
            return h.continue;
        }

        // if insufficient scope redirect root
        var schema = Joi.string().regex(/^Insufficient scope/);
        var result = Joi.validate(response.message, schema);
        if (result.error === null) {

            // insufficient scope, redirect to root
            return h.redirect('/');
        }

        return h.continue;
    });
};

exports.plugin = {
    name: 'route-errors',
    pkg: Package,
    register
};
