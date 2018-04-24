const Joi = require('joi');
const Auth = require('plugins/auth');
const RegisterCtrl = require('modules/authorization/controllers/api/register');

// POST /register
exports.register = {
    description: 'Registers a new user',
    handler: RegisterCtrl.register,
    auth: false,
    validate: {
        query: {
            token: Joi.string()
                .regex(Auth.token.REGEX)
                .min(32)
                .required()
        },
        payload: {
            name: Joi.string()
                .min(6)
                .max(64)
                .required(),
            username: Joi.string()
                .min(3)
                .max(32)
                .required(),
            email: Joi.string()
                .email()
                .required(),
            password: Joi.string()
                .min(3)
                .max(32)
                .required()
        }
    },
    plugins: {
        stateless: true
    }
};
