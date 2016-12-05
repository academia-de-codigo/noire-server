'use strict';

var Joi = require('joi');
var LoginCtrl = require('../../controllers/login');
var User = require('../../models/user');

// POST /login
exports.login = {
    description: 'Authenticate user credentials',
    handler: LoginCtrl.login,
    auth: false,
    validate: {
        payload: {
            email: Joi.string().email().required(),
            password: Joi.string().min(User.PASSWORD_MIN_LENGTH).max(User.PASSWORD_MAX_LENGTH).required()
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
