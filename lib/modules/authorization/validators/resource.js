const Joi = require('@hapi/joi');

const validator = {};

validator.validateResourceName = function(name) {
    Joi.object({
        name: Joi.string()
            .required()
            .description(name)
    }).label('Resource Name Schema');
};

module.exports = validator;
