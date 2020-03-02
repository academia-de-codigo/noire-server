const Joi = require('@hapi/joi');
const User = require('models/authorization/user');

const validator = {};

validator.validateProfileUpdateFields = function(username, name, email, password, avatar) {
    return Joi.object({
        username: Joi.string()
            .min(User.USERNAME_MIN_LENGTH)
            .max(User.USERNAME_MAX_LENGTH)
            .description(username),
        name: Joi.string()
            .min(User.NAME_MIN_LENGTH)
            .max(User.NAME_MAX_LENGTH)
            .description(name),
        email: Joi.string()
            .email()
            .description(email),
        password: Joi.string()
            .min(User.PASSWORD_MIN_LENGTH)
            .max(User.PASSWORD_MAX_LENGTH)
            .description(password),
        avatar: Joi.string()
            .uri({
                scheme: ['http', 'https'],
                allowRelative: true
            })
            .description(avatar),
        roles: Joi.forbidden(),
        active: Joi.forbidden()
    }).label('Profile Update Schema');
};

module.exports = validator;
