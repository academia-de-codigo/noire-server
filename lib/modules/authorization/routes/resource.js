/**
 * Api resource routes
 */

const Joi = require('@hapi/joi');
const AuthCtrl = require('modules/authorization/controllers/authorization');
const ResourceCtrl = require('modules/authorization/controllers/resource');
const Resources = require('enums/resources');
const Actions = require('utils/action');
const { documentationTags } = require('config');

const tags = documentationTags.authorization;

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
        params: Joi.object({
            name: Joi.string()
                .required()
                .description('The name of the resource')
        })
    }
};
