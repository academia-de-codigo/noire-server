const Joi = require('@hapi/joi');
const Auth = require('plugins/auth');
const RegisterCtrl = require('modules/authorization/controllers/register');
const User = require('models/authorization/user');

// POST /register
exports.register = {
    description: 'Registers a new user',
    handler: RegisterCtrl.register,
    auth: false,
    validate: {
        query: Joi.object({
            token: Joi.string()
                .regex(Auth.token.REGEX)
                .min(32)
                .required()
                .description('The auth token')
        }),
        payload: Joi.object({
            name: Joi.string()
                .min(User.NAME_MIN_LENGTH)
                .max(User.NAME_MAX_LENGTH)
                .required()
                .description('The real name of the user'),
            username: Joi.string()
                .min(User.USERNAME_MIN_LENGTH)
                .max(User.USERNAME_MAX_LENGTH)
                .required()
                .description('The username of the user'),
            email: Joi.string()
                .email()
                .max(User.EMAIL_MAX_LENGTH)
                .required()
                .description('The email of the user'),
            password: Joi.string()
                .min(User.PASSWORD_MIN_LENGTH)
                .max(User.PASSWORD_MAX_LENGTH)
                .required()
                .description('The password of the user')
        })
    }
};
