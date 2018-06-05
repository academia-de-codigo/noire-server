/**
 * Permission model
 * @module
 */
const BaseModel = require('models/base');
const Action = require('utils/action');

/**
 * Permission model class
 * @class Permission
 * @extends {BaseModel}
 */
class Permission extends BaseModel {
    /**
     * Gets the database table name
     * @readonly
     * @static
     * @memberof Permission
     * @returns {string} the database table name
     */
    static get tableName() {
        return 'permissions';
    }

    /**
     * Get the json schema for model validation
     * @readonly
     * @static
     * @memberof Permission
     * @returns {Object} the json schema
     */
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['action', 'resourceId'],
            properties: {
                id: {
                    type: 'integer'
                },
                action: {
                    type: 'string',
                    enum: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
                    default: Action.READ
                },
                resourceId: {
                    type: 'integer'
                }
            }
        };
    }

    /**
     * Gets the model relations
     * @readonly
     * @static
     * @memberof User
     * @returns {Object} the model relations
     */
    static get relationMappings() {
        return {
            resource: {
                relation: BaseModel.HasOneRelation,
                modelClass: 'resource',
                join: {
                    from: 'permissions.resourceId',
                    to: 'resources.id'
                }
            },
            roles: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: 'role',
                join: {
                    from: 'permissions.id',
                    through: {
                        from: 'roles_permissions.permissionId',
                        to: 'roles_permissions.roleId'
                    },
                    to: 'roles.id'
                }
            }
        };
    }
}

module.exports = Permission;
