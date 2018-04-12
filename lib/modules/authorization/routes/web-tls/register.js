const Joi = require('joi');
const RegisterCtrl = require('modules/authorization/controllers/api/register');

const JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/;

// GET /register
exports.getRegister = {
    description: 'Returns the user registration form',
    auth: false,
    handler: RegisterCtrl.register,
    validate: {
        query: {
            token: Joi.string()
                .regex(JWT_REGEX)
                .min(32)
                .required()
        }
    }
};

// POST /register
exports.postRegister = {
    description: 'Registers up a new user',
    handler: RegisterCtrl.doRegister,
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
