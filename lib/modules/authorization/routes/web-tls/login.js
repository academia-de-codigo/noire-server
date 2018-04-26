/**
 * Web Tls login routes
 * @module
 */
const Joi = require('joi');
const User = require('models/user');
const ApiLoginCtrl = require('modules/authorization/controllers/api/login');
const WebTlsLoginCtrl = require('modules/authorization/controllers/web-tls/login');
const Auth = require('plugins/auth');

// GET /login
exports.getLogin = {
    description: 'Returns the login page',
    auth: false,
    handler: {
        view: {
            template: 'pages/login'
        }
    }
};

// POST /login
exports.postLogin = {
    description: 'User login',
    handler: ApiLoginCtrl.login,
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
        stateless: false
    }
};

// GET /logout
exports.logout = {
    description: 'User logout',
    handler: ApiLoginCtrl.logout,
    plugins: {
        stateless: false
    }
};

// GET /password-reset
exports.getPasswordReset = {
    description: 'Returns the password reset form',
    auth: false,
    handler: {
        view: {
            template: 'pages/password-reset'
        }
    }
};

// POST /password-reset
exports.postPasswordReset = {
    description: 'Sends a password reset email',
    handler: ApiLoginCtrl.passwordReset,
    auth: false,
    validate: {
        payload: {
            email: Joi.string().email()
        }
    }
};

// GET /password-update
exports.getPasswordUpdate = {
    description: 'Returns the user registration form',
    auth: false,
    handler: WebTlsLoginCtrl.showPasswordUpdate,
    validate: {
        query: {
            token: Joi.string()
                .regex(Auth.token.REGEX)
                .required()
        }
    }
};

// POST /password-update
exports.postPasswordUpdate = {
    description: 'Registers up a new user',
    handler: ApiLoginCtrl.passwordUpdate,
    auth: false,
    validate: {
        payload: {
            email: Joi.string()
                .email()
                .required(),
            password: Joi.string()
                .min(User.PASSWORD_MIN_LENGTH)
                .max(User.PASSWORD_MAX_LENGTH)
                .required()
        }
    }
};
