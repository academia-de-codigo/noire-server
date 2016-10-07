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

            // Joi Validation Failed
            if (request.response.output.statusCode === 400) {

                // statusCode 400 Bad Request
                // "The server cannot or will not process the request due to something that is perceived to be a client error
                // (e.g., malformed request syntax, invalid request message framing, or deceptive request routing)."
                return reply(Boom.badRequest('Malformed Data Entered'));
            }

            // Catch insufficient scope responses.
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
