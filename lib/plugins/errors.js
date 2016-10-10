'use strict';

var Boom = require('boom');
var Joi = require('joi');
var Package = require('../../package.json');

exports.register = function(server, options, next) {

    server.ext('onPreResponse', function(request, reply) {

        if (request.response.isBoom) {

            // handle Bad Route Attempt
            if (request.response.output.statusCode === 404 && request.response.message === 'Not Found') {
                return reply.redirect(request.connection.info.uri).permanent();
            }
        }

        return reply.continue();
    });

    server.ext('onPreResponse', function(request, reply) {

        if (request.response.isBoom) {

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
