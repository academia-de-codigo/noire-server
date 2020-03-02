/**
 * API permission routes
 * @module
 */
const AuthCtrl = require('modules/authorization/controllers/authorization');
const PermissionCtrl = require('modules/authorization/controllers/permission');
const Resources = require('enums/resources');
const Actions = require('enums/actions');
const Validator = require('modules/authorization/validators/permission');
const { documentationTags } = require('config');

const tags = documentationTags.authorization;

const descriptions = {
    query: [
        'The limit of permissions to get',
        'The page to get the permissions from',
        'The search criteria',
        'The sorting order'
    ],
    id: 'The ID of the permission',
    create: [
        'The action associated with the permission',
        'The resource the permission refers to',
        'The description of the permission'
    ],
    update: 'The description of the permission'
};

// GET /permission
exports.list = {
    description: 'List available permissions',
    pre: [AuthCtrl.authorize(Resources.PERMISSION, Actions.LIST)],
    handler: PermissionCtrl.list,
    tags,
    validate: {
        query: Validator.validateQueryParams(...descriptions.query)
    }
};

// GET /permission/{id}
exports.get = {
    description: 'Get permission by ID',
    pre: [AuthCtrl.authorize(Resources.PERMISSION)],
    handler: PermissionCtrl.get,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id)
    }
};

// POST /permission
exports.create = {
    description: 'Adds a new permission',
    pre: [AuthCtrl.authorize(Resources.PERMISSION)],
    handler: PermissionCtrl.create,
    tags,
    validate: {
        payload: Validator.validatePermissionCreationFields(...descriptions.create)
    }
};

// DELETE /permission/{id}
exports.delete = {
    description: 'Delete an existing permission',
    pre: [AuthCtrl.authorize(Resources.PERMISSION)],
    handler: PermissionCtrl.delete,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id)
    }
};

// PUT /permission/{id}
exports.update = {
    description: 'Update an existing permission',
    pre: [AuthCtrl.authorize(Resources.PERMISSION)],
    handler: PermissionCtrl.update,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id),
        payload: Validator.validatePermissionUpdateFields(descriptions.update)
    }
};
