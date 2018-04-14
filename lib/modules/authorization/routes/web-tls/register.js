const Joi = require('joi');
const RegisterCtrl = require('modules/authorization/controllers/api/register');
const Auth = require('plugins/auth');

// GET /register
exports.getRegister = {
    description: 'Returns the user registration form',
    auth: false,
    handler: RegisterCtrl.showRegister,
    validate: {
        query: {
            token: Joi.string()
                .regex(Auth.token.REGEX)
                .min(32)
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
            name: Joi.string(),
            username: Joi.string(),
            email: Joi.string().email(),
            password: Joi.string()
        }
    },
    plugins: {
        stateless: false
    }
};
