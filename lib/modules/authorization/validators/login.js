const Joi = require('@hapi/joi');
const User = require('models/authorization/user');
const baseValidator = require('./base');

const validator = { ...baseValidator };

validator.validateLoginCredentials = function(username, password) {
    return Joi.object({
        username: Joi.string()
            .min(User.USERNAME_MIN_LENGTH)
            .max(User.USERNAME_MAX_LENGTH)
            .required()
            .description(username),
        password: Joi.string()
            .min(User.PASSWORD_MIN_LENGTH)
            .max(User.PASSWORD_MAX_LENGTH)
            .required()
            .description(password)
    }).label('Login Credentials Schema');
};

validator.validatePassUpdate = function(email, password) {
    return Joi.object({
        email: Joi.string()
            .email()
            .required()
            .description(email),
        password: Joi.string()
            .min(User.PASSWORD_MIN_LENGTH)
            .max(User.PASSWORD_MAX_LENGTH)
            .required()
            .description(password)
    }).label('Password Update Schema');
};

module.exports = validator;
