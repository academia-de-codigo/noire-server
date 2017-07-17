var Joi = require('joi');
var RoleCtrl = require('../../controllers/api/role');
var AuthCtrl = require('../../controllers/auth');

var resource = 'role';

exports.get = {
    description: 'Gets a specific role by ID',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.get,
    validate: {
        params: {
            id: Joi.number().integer().required()
        }
    }
};

exports.delete = {
    description: 'Deletes an existing role',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.delete,
    response: {
        emptyStatusCode: '204'
    },
    validate: {
        params: {
            id: Joi.number().integer().required()
        }
    }
};
