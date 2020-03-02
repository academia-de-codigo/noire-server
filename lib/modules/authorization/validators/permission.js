const Joi = require('@hapi/joi');
const Permission = require('models/authorization/permission');
const Resource = require('models/authorization/resource');
const Actions = require('enums/actions');
const baseValidator = require('./base');

const validator = { ...baseValidator };

validator.validatePermissionCreationFields = function(action, resource, description) {
    return Joi.object({
        action: Joi.string()
            .valid(...Object.values(Actions))
            .required()
            .description(action),
        resource: Joi.string()
            .min(Resource.NAME_MIN_LENGTH)
            .max(Resource.NAME_MAX_LENGTH)
            .required()
            .description(resource),
        description: Joi.string()
            .max(Permission.DESCRIPTION_MAX_LENGTH)
            .required()
            .description(description)
    }).label('Permission Creation Schema');
};

validator.validatePermissionUpdateFields = function(description) {
    return Joi.object({
        id: Joi.forbidden(),
        action: Joi.forbidden(),
        resource: Joi.forbidden(),
        description: Joi.string()
            .max(Permission.DESCRIPTION_MAX_LENGTH)
            .required()
            .description(description)
    }).label('Permission Update Schema');
};

module.exports = validator;
