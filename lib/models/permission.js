var Model = require('./base');
var action = require('../action');

function Permission() {
    Model.apply(this, arguments);
}

Model.extend(Permission);
module.exports = Permission;

Permission.tableName = 'permission';
Permission.jsonSchema = {
    type: 'object',
    required: ['action', 'resource_id'],
    properties: {
        id: {
            type: 'integer'
        },
        action: {
            type: 'string',
            enum: [action.CREATE, action.READ, action.UPDATE, action.DELETE],
            default: action.READ
        },
        resource_id: {
            type: 'integer'
        }
    }
};

Permission.relationMappings = {
    resource: {
        relation: Model.HasOneRelation,
        modelClass: 'resource',
        join: {
            from: 'permission.resource_id',
            to: 'resource.id'
        }
    },

    roles: {
        relation: Model.ManyToManyRelation,
        modelClass: 'role',
        join: {
            from: 'permission.id',
            through: {
                from: 'role_permission.permission_id',
                to: 'role_permission.role_id'
            },
            to: 'role.id'
        }
    }
};
