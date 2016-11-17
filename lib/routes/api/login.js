'use strict';

var Joi = require('joi');
var LoginCtrl = require('../../controllers/login');

// POST /login
exports.login = {
    description: 'Authenticate user credentials',
    handler: LoginCtrl.login,
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
};

// GET /logout
exports.logout = {
    handler: LoginCtrl.logout,
    description: 'Destroys authenticated session',
    plugins: {
        stateless: true
    }
};
