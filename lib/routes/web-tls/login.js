'use strict';

var Joi = require('joi');
var User = require('../../models/user');
var LoginCtrl = require('../../controllers/api/login');

// POST /login
exports.login = {
    description: 'User login',
    handler: LoginCtrl.login,
    auth: false,
    validate: {
        payload: {
            username: Joi.string().min(User.USERNAME_MIN_LENGTH).max(User.USERNAME_MAX_LENGTH).required(),
            password: Joi.string().min(User.PASSWORD_MIN_LENGTH).max(User.PASSWORD_MAX_LENGTH).required()
        }
    },
    plugins: {
        stateless: false
    }
};

// GET /logout
exports.logout = {
    description: 'User logout',
    handler: LoginCtrl.logout,
    plugins: {
        stateless: false
    }
};
