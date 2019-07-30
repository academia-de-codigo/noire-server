/**
 * Api permission routes
 */
const Joi = require('joi');
const AuthCtrl = require('modules/authorization/controllers/authorization');
const PermissionCtrl = require('modules/authorization/controllers/permission');
const Permission = require('models/authorization/permission');
const Resource = require('models/authorization/resource');
const Resources = require('enums/resources');
const Actions = require('enums/actions');

// GET /permission
exports.list = {
    description: 'List available permissions',
    pre: [AuthCtrl.authorize(Resources.PERMISSION, Actions.LIST)],
    handler: PermissionCtrl.list,
    validate: {
        query: {
            limit: Joi.number()
                .integer()
                .min(1)
                .max(100)
                .description('The limit of permissions to get'),
            page: Joi.number()
                .integer()
                .positive()
                .description('The page to get the permissions from'),
            search: Joi.string().description('The search criteria'),
            sort: Joi.string().description('The sorting order')
        }
    }
};

// GET /permission/{id}
exports.get = {
    description: 'Get permission by ID',
    pre: [AuthCtrl.authorize(Resources.PERMISSION)],
    handler: PermissionCtrl.get,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the permission')
        }
    }
};

// POST /permission
exports.create = {
    description: 'Adds a new permission',
    pre: [AuthCtrl.authorize(Resources.PERMISSION)],
    handler: PermissionCtrl.create,
    validate: {
        payload: {
            action: Joi.string()
                .valid(Object.values(Actions))
                .required()
                .description('The action associated with the permission'),
            resource: Joi.string()
                .min(Resource.NAME_MIN_LENGTH)
                .max(Resource.NAME_MAX_LENGTH)
                .required()
                .description('The resource the permission refers to'),
            description: Joi.string()
                .max(Permission.DESCRIPTION_MAX_LENGTH)
                .required()
                .description('The description of the permission')
        }
    }
};

// DELETE /permission/{id}
exports.delete = {
    description: 'Delete an existing permission',
    pre: [AuthCtrl.authorize(Resources.PERMISSION)],
    handler: PermissionCtrl.delete,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the permission')
        }
    }
};

// PUT /permission/{id}
exports.update = {
    description: 'Update an existing permission',
    pre: [AuthCtrl.authorize(Resources.PERMISSION)],
    handler: PermissionCtrl.update,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The id of the permission')
        },
        payload: {
            id: Joi.forbidden(),
            action: Joi.forbidden(),
            resource: Joi.forbidden(),
            description: Joi.string()
                .max(Permission.DESCRIPTION_MAX_LENGTH)
                .required()
                .description('The description of the permission')
        }
    }
};
