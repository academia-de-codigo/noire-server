/**
 * Api resource routes
 */

const AuthCtrl = require('modules/authorization/controllers/authorization');
const ResourceCtrl = require('modules/authorization/controllers/api/resource');
const Resources = require('enums/resources');
const Actions = require('utils/action');

// GET /resource
exports.list = {
    description: 'Lists all resources and permissions in the system',
    pre: [AuthCtrl.authorize(Resources.ROLE, Actions.LIST)],
    handler: ResourceCtrl.list
};
