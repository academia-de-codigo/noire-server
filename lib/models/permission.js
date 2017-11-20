/**
 * Permission model
 * @module
 */
const Path = require('path');
const BaseModel = require('./base');
const action = require(Path.join(process.cwd(), 'lib/utils/action'));

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
        return 'permission';
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
    }
}

module.exports = Permission;
