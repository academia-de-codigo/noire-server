const BaseModel = require('./base');
const action = require('../utils/action');

/**
 * Permission Model
 * @class Permission
 * @extends {BaseModel}
 */
class Permission extends BaseModel {}

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
        relation: BaseModel.HasOneRelation,
        modelClass: 'resource',
        join: {
            from: 'permission.resource_id',
            to: 'resource.id'
        }
    },

    roles: {
        relation: BaseModel.ManyToManyRelation,
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
