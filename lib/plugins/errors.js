'use strict';

var Boom = require('boom');
var Joi = require('joi');
var Package = require('../../package.json');

exports.register = function(server, options, next) {

    // handle bad route attempts
    server.ext('onPreResponse', function(request, reply) {

        if (request.response.isBoom) {

            // we need to explicitely test for redirect property to be false,
            // as undefined means that we can redirect
            if (request.route.settings.app.redirect === false) {
                return reply.continue();
            }

            if (request.response.output.statusCode === 404 && request.response.message === 'Not Found') {
                return reply.redirect(request.connection.info.uri).permanent();
            }
        }

        return reply.continue();
    });

    // handle route errors
    server.ext('onPreResponse', function(request, reply) {

        if (request.response.isBoom) {

            // we need to explicitely test for redirect property to be false,
            // as undefined means that we can redirect
            if (request.route.settings.app.redirect === false) {
                return reply.continue();
            }

            // handle joi validation failures
            if (request.response.output.statusCode === 400) {

                // replace joi detailed error message with something simpler
                return reply(Boom.badRequest('Malformed Data Entered'));
            }

            // if insufficient scope redirect home
            var schema = Joi.string().regex(/^Insufficient scope/);
            var result = Joi.validate(request.response.message, schema);

            if (result.error === null) {
                return reply.redirect(request.connection.info.uri);
            }

        }

        return reply.continue();
    });

    return next();

};

exports.register.attributes = {
    name: 'errors',
    pkg: Package
};
