const Joi = require('@hapi/joi');
const Role = require('models/authorization/role');
const Permission = require('models/authorization/permission');
const Resource = require('models/authorization/resource');
const baseValidator = require('./base');

const validator = { ...baseValidator };

validator.validateRoleCreationFields = function(name, description) {
    return Joi.object({
        name: Joi.string()
            .min(Role.NAME_MIN_LENGTH)
            .max(Role.NAME_MAX_LENGTH)
            .required()
            .description(name),
        description: Joi.string()
            .max(Role.DESC_MAX_LENGTH)
            .description(description)
    }).label('Role Creation Schema');
};

validator.validateRoleUpdateFields = function(name, description) {
    return Joi.object({
        id: Joi.forbidden(),
        name: Joi.string()
            .min(Role.NAME_MIN_LENGTH)
            .max(Role.NAME_MAX_LENGTH)
            .description(name),
        description: Joi.string()
            .max(Role.DESC_MAX_LENGTH)
            .description(description)
    }).label('Role Update Schema');
};

validator.validateArrayOfIdsOrSingleId = function(array, single) {
    return Joi.alternatives().try(
        this.validateArrayOfRequiredIds(array),
        this.validateRequiredId(single)
    );
};

validator.validateAddingPermission = function(action, resource, description) {
    return Joi.object({
        action: Joi.string()
            .required()
            .description(action),
        resource: Joi.string()
            .min(Resource.NAME_MIN_LENGTH)
            .max(Resource.NAME_MAX_LENGTH)
            .description(resource),
        description: Joi.string()
            .max(Permission.DESCRIPTION_MAX_LENGTH)
            .description(description)
    }).label('Add Permission Schema');
};

module.exports = validator;
