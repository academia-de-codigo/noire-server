/**
 * Api resource routes
 * @module
 */
const AuthCtrl = require('modules/authorization/controllers/authorization');
const ResourceCtrl = require('modules/authorization/controllers/resource');
const Resources = require('enums/resources');
const Actions = require('utils/action');
const Validator = require('modules/authorization/validators/resource');
const { documentationTags } = require('config');

const tags = documentationTags.authorization;

const descriptions = {
    name: 'The name of the resource'
};

// GET /resource
exports.list = {
    description: 'Lists all resources and permissions in the system',
    pre: [AuthCtrl.authorize(Resources.ROLE, Actions.LIST)],
    handler: ResourceCtrl.list,
    tags
};

// GET /resource/{name}
exports.get = {
    description: 'Gets a resource by name',
    pre: [AuthCtrl.authorize(Resources.PERMISSION)],
    handler: ResourceCtrl.getByName,
    tags,
    validate: {
        params: Validator.validateResourceName(descriptions.name)
    }
};
