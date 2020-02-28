/**
 * API login routes
 * @module
 */

const Joi = require('@hapi/joi');
const LoginCtrl = require('modules/authorization/controllers/login');
const User = require('models/authorization/user');
const { documentationTags } = require('config');

const tags = documentationTags.authorization;

// POST /login
exports.login = {
    auth: false,
    description: 'Authenticate user credentials',
    handler: LoginCtrl.login,
    tags,
    validate: {
        payload: Joi.object({
            username: Joi.string()
                .min(User.USERNAME_MIN_LENGTH)
                .max(User.USERNAME_MAX_LENGTH)
                .required()
                .description('The username of the user to login'),
            password: Joi.string()
                .min(User.PASSWORD_MIN_LENGTH)
                .max(User.PASSWORD_MAX_LENGTH)
                .required()
                .description('The password of the user')
        })
    },
    plugins: {
        stateless: true
    }
};

// GET /logout
exports.logout = {
    description: 'Destroys authenticated session',
    handler: LoginCtrl.logout,
    tags,
    plugins: {
        stateless: true
    }
};

// GET /renew
exports.renew = {
    description: 'Renews an authenticated session',
    handler: LoginCtrl.renew,
    tags
};

// POST /password-reset
exports.passwordReset = {
    auth: false,
    description: 'Sends a password reset email',
    handler: LoginCtrl.passwordReset,
    tags,
    validate: {
        payload: Joi.object({
            email: Joi.string()
                .email()
                .description('The email of the user to reset')
        })
    }
};

// POST /password-update
exports.passwordUpdate = {
    auth: false,
    description: 'Registers up a new user',
    handler: LoginCtrl.passwordUpdate,
    tags,
    validate: {
        payload: Joi.object({
            email: Joi.string()
                .email()
                .required()
                .description('The email of the user to update'),

            password: Joi.string()
                .min(User.PASSWORD_MIN_LENGTH)
                .max(User.PASSWORD_MAX_LENGTH)
                .required()
                .description('The new password')
        })
    }
};
