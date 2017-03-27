var Joi = require('joi');
var AdminCtrl = require('../../controllers/web/admin');

// GET /admin/{partial}
exports.get = {
    description: 'Returns the admin section',
    auth: {
        scope: 'admin'
    },
    validate: {
        params: {
            partial: Joi.string().optional()
        }
    },
    handler: AdminCtrl.get
};

// GET /admin/user/{id}
exports.getUser = {
    description: 'Returns the admin user section',
    auth: {
        scope: 'admin'
    },
    validate: {
        params: {
            id: Joi.number().required()
        }
    },
    handler: AdminCtrl.getUser
};

// GET /admin/role/{id}
exports.getRole = {
    description: 'Returns the admin role section',
    auth: {
        scope: 'admin'
    },
    validate: {
        params: {
            id: Joi.number().required()
        }
    },
    handler: AdminCtrl.getRole
};
