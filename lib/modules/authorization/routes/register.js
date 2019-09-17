const Joi = require('@hapi/joi');
const Auth = require('plugins/auth');
const RegisterCtrl = require('modules/authorization/controllers/register');

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
                .min(6)
                .max(64)
                .required()
                .description('The real name of the user'),
            username: Joi.string()
                .min(3)
                .max(32)
                .required()
                .description('The username of the user'),
            email: Joi.string()
                .email()
                .required()
                .description('The email of the user'),
            password: Joi.string()
                .min(3)
                .max(32)
                .required()
                .description('The password of the user')
        })
    }
};
