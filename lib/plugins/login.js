'use strict';

var Joi = require('joi');
var Config = require('../config');
var LoginCtrl = require('../controllers/login');
var Package = require('../../package.json');

exports.register = function(server, options, next) {

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
                stateless: false
            }
        }
    });

    server.route({
        path: '/logout',
        method: 'GET',
        handler: LoginCtrl.logout,
        config: {
            plugins: {
                stateless: false
            }
        }
    });

    return next();

};

exports.register.attributes = {
    name: 'login',
    pkg: Package
};
