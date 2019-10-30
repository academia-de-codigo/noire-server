/**
 * API login routes
 * @module
 */

const Joi = require('@hapi/joi');
const LoginCtrl = require('modules/authorization/controllers/login');
const User = require('models/authorization/user');

// POST /login
exports.login = {
    description: 'Authenticate user credentials',
    handler: LoginCtrl.login,
    auth: false,
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
    }
};

// GET /renew
exports.renew = {
    description: 'Renews an authenticated session',
    handler: LoginCtrl.renew
};

// POST /password-reset
exports.passwordReset = {
    description: 'Sends a password reset email',
    handler: LoginCtrl.passwordReset,
    auth: false,
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
    description: 'Registers up a new user',
    handler: LoginCtrl.passwordUpdate,
    auth: false,
    validate: {
        payload: Joi.object({
            email: Joi.string()
                .email()
                .max(User.EMAIL_MAX_LENGTH)
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
