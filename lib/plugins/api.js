'use strict';

var Joi = require('joi');
var Package = require('../../package.json');
var LoginCtrl = require('../controllers/login');
var RoleCtrl = require('../controllers/role');
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
            description: 'Returns the api version',
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
            description: 'Authenticate user credentials',
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
        path: Config.paths.logout,
        method: 'GET',
        handler: LoginCtrl.logout,
        config: {
            description: 'Destroys authenticated session',
            plugins: {
                stateless: true
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/role',
        config: {
            description: 'Lists available roles',
            auth: {
                scope: 'admin'
            },
            handler: RoleCtrl.list
        }
    });

    server.route({
        method: 'GET',
        path: '/role/{id}',
        config: {
            description: 'Get a specific by ID',
            auth: {
                scope: 'admin'
            },
            handler: RoleCtrl.get
        }
    });

    server.route({
        method: 'POST',
        path: '/role',
        config: {
            description: 'Adds a new role',
            auth: {
                scope: 'admin'
            },
            validate: {
                payload: {
                    name: Joi.string().min(3).max(16).required()
                }
            },
            handler: RoleCtrl.create
        }
    });

    return next();

};

exports.register.attributes = {
    name: 'api',
    pkg: Package
};
