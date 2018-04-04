/**
 * API login routes
 * @module
 */

const Joi = require('joi');
const Path = require('path');
const LoginCtrl = require(Path.join(
    process.cwd(),
    'lib/modules/authorization/controllers/api/login'
));
const User = require(Path.join(process.cwd(), 'lib/models/user'));

// POST /login
exports.login = {
    description: 'Authenticate user credentials',
    handler: LoginCtrl.login,
    auth: false,
    validate: {
        payload: {
            username: Joi.string()
                .min(User.USERNAME_MIN_LENGTH)
                .max(User.USERNAME_MAX_LENGTH)
                .required(),
            password: Joi.string()
                .min(User.PASSWORD_MIN_LENGTH)
                .max(User.PASSWORD_MAX_LENGTH)
                .required()
        }
    },
    plugins: {
        stateless: true
    }
};

// GET /logout
exports.logout = {
    description: 'Destroys authenticated session',
    handler: LoginCtrl.logout,
    plugins: {
        stateless: true
    }
};

// GET /renew
exports.renew = {
    description: 'Renews an authenticated session',
    handler: LoginCtrl.renew
};
