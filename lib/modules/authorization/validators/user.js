const Joi = require('@hapi/joi');
const User = require('models/authorization/user');
const baseValidator = require('./base');

const validator = { ...baseValidator };

validator.validateUserCreationFields = function(username, name, email, password, avatar) {
    return Joi.object({
        username: Joi.string()
            .min(User.USERNAME_MIN_LENGTH)
            .max(User.USERNAME_MAX_LENGTH)
            .required()
            .description(username),
        name: Joi.string()
            .min(User.NAME_MIN_LENGTH)
            .max(User.NAME_MAX_LENGTH)
            .required()
            .description(name),
        email: Joi.string()
            .email()
            .required()
            .description(email),
        password: Joi.string()
            .min(User.PASSWORD_MIN_LENGTH)
            .max(User.PASSWORD_MAX_LENGTH)
            .required()
            .description(password),
        avatar: Joi.string()
            .uri({
                scheme: ['http', 'https'],
                allowRelative: true
            })
            .description(avatar)
    }).label('User Creation Schema');
};

validator.validateUserUpdateFields = function(username, name, email, password, avatar, active) {
    return Joi.object({
        id: Joi.forbidden(),
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
        active: Joi.boolean().description(active),
        roles: Joi.forbidden()
    }).label('User Update Schema');
};

module.exports = validator;
