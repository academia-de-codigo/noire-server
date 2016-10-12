'use strict';

var Joi = require('joi');
var Package = require('../../package.json');
var LoginCtrl = require('../controllers/login');
var Config = require('../config');

var internals = {
    response: {
        version: Package.version
    }
};

exports.register = function(server, options, next) {

    server.route({
        path: '/version',
        method: 'GET',
        config: {
            auth: false,
            description: 'Returns the version of the server',
            handler: function(request, reply) {

                return reply(internals.response);
            }
        }
    });

    server.route({
        path: Config.paths.login,
        method: 'POST',
        handler: LoginCtrl.login,
        config: {
            auth: false,
            validate: {
                payload: {
                    email: Joi.string().email().required(),
                    password: Joi.string().min(3).max(200).required()
                }
            },
            plugins: {
                stateless: true
            }
        }
    });

    server.route({
        path: '/logout',
        method: 'GET',
        handler: LoginCtrl.logout,
        config: {
            plugins: {
                stateless: true
            }
        }
    });

    return next();

};

exports.register.attributes = {
    name: 'api',
    pkg: Package
};
