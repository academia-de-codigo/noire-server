const Joi = require('@hapi/joi');

const validator = {};

validator.validateResourceName = function(name) {
    Joi.object({
        name: Joi.string()
            .required()
            .description(name)
    }).label('ResourceNameSchema');
};

module.exports = validator;
