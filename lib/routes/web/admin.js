'use strict';

var Joi = require('joi');
var AdminCtrl = require('../../controllers/web/admin');
var AuthCtrl = require('../../controllers/authorization');

// GET /admin
exports.get = {
    description: 'Returns the admin section',
    auth: {
        scope: 'admin'
    },
    validate: {
        query: {
            p: Joi.string().optional()
        }
    },
    handler: AdminCtrl.get
};

// GET /users
exports.getUsers = {
    description: 'Returns the admin users section',
    pre: [AuthCtrl.authorize('user')],
    handler: AdminCtrl.getUsers
};

// GET /roles
exports.getRoles = {
    description: 'Returns the admin roles section',
    pre: [AuthCtrl.authorize('role')],
    handler: AdminCtrl.getRoles
};
