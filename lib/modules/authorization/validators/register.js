const Joi = require('@hapi/joi');
const Auth = require('plugins/auth');

const validator = {};

validator.validateAuthToken = function(token) {
    return Joi.object({
        token: Joi.string()
            .regex(Auth.token.REGEX)
            .min(32)
            .required()
            .description(token)
    }).label('AuthenticationTokenSchema');
};

validator.validateRegisterFields = function(name, username, email, password) {
    return Joi.object({
        name: Joi.string()
            .min(6)
            .max(64)
            .required()
            .description(name),
        username: Joi.string()
            .min(3)
            .max(32)
            .required()
            .description(username),
        email: Joi.string()
            .email()
            .required()
            .description(email),
        password: Joi.string()
            .min(3)
            .max(32)
            .required()
            .description(password)
    }).label('RegisterSchema');
};

module.exports = validator;
