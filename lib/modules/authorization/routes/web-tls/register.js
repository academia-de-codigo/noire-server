const Joi = require('joi');
const RegisterCtrl = require('modules/authorization/controllers/api/register');
const Auth = require('plugins/auth');
const User = require('models/user');

// GET /register
exports.getRegister = {
    description: 'Returns the user registration form',
    auth: false,
    handler: RegisterCtrl.showRegister,
    validate: {
        query: {
            token: Joi.string()
                .regex(Auth.token.REGEX)
                .required()
        }
    }
};

// POST /register
exports.postRegister = {
    description: 'Registers up a new user',
    handler: RegisterCtrl.register,
    auth: false,
    validate: {
        payload: {
            name: Joi.string()
                .min(User.NAME_MIN_LENGTH)
                .max(User.NAME_MAX_LENGTH)
                .required(),
            username: Joi.string()
                .min(User.USERNAME_MIN_LENGTH)
                .max(User.USERNAME_MAX_LENGTH)
                .required(),
            email: Joi.string()
                .email()
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
