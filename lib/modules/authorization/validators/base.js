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
    }).label('QueryParametersSchema');
};

baseValidator.validateRequiredEmail = function(email) {
    return Joi.object({
        email: Joi.string()
            .email()
            .required()
            .description(email)
    }).label('RequiredEmailSchema');
};

baseValidator.validateRequiredId = function(single) {
    return Joi.object({
        id: Joi.number()
            .integer()
            .positive()
            .required()
            .description(single)
    }).label('RequiredIdSchema');
};

baseValidator.validateArrayOfRequiredIds = function(array) {
    return Joi.object({
        id: Joi.array()
            .items(
                Joi.number()
                    .integer()
                    .positive()
                    .required()
                    .description(array)
            )
            .unique()
    }).label('ArrayOfId\'sSchema');
};

module.exports = baseValidator;
