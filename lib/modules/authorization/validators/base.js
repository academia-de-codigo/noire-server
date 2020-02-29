const Joi = require('@hapi/joi');

const baseValidator = {};

baseValidator.validateQueryParams = function(limit, page, search, sort) {
    return Joi.object({
        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .description(limit),
        page: Joi.number()
            .integer()
            .positive()
            .description(page),
        search: Joi.string().description(search),
        sort: Joi.string().description(sort)
    }).label('Query Parameters Schema');
};

baseValidator.validateRequiredEmail = function(email) {
    return Joi.object({
        email: Joi.string()
            .email()
            .required()
            .description(email)
    }).label('Required Email Schema');
};

baseValidator.validateRequiredId = function(id) {
    return Joi.object({
        id: Joi.number()
            .integer()
            .positive()
            .required()
            .description(id)
    }).label('Required Id Schema');
};

module.exports = baseValidator;
