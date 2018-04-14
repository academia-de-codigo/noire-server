const Joi = require('joi');
const User = require('models/user');
const LoginCtrl = require('modules/authorization/controllers/api/login');
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
    handler: LoginCtrl.passwordReset,
    auth: false,
    validate: {
        payload: {
            email: Joi.string().email()
        }
    },
    plugins: {
        stateless: false
    }
};

// GET /password-update
exports.getPasswordUpdate = {
    description: 'Returns the user registration form',
    auth: false,
    handler: LoginCtrl.showPasswordUpdate,
    validate: {
        query: {
            token: Joi.string()
                .regex(Auth.token.REGEX)
                .min(32)
                .required()
        }
    }
};

// POST /password-update
exports.postPasswordUpdate = {
    description: 'Registers up a new user',
    handler: LoginCtrl.passwordUpdate,
    auth: false,
    validate: {
        payload: {
            email: Joi.string().email(),
            password: Joi.string()
        }
    },
    plugins: {
        stateless: false
    }
};
