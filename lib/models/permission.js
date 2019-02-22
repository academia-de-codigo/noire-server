/**
 * Permission model
 * @module
 */
const BaseModel = require('models/base');
const Actions = require('enums/actions');

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
     * Get the model properties to perform search on
     * @readonly
     * @static
     * @memberof Permission
     * @returns {Array.<string>} the model properties
     */
    static get searchFields() {
        return ['description', 'action'];
    }

    /**
     * Get the model properties to hide when converting to JSON
     * @readonly
     * @static
     * @memberof Permission
     * @returns {Array.<string>} the model properties
     */
    static get hiddenFields() {
        return ['resourceId'];
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
            required: ['action', 'resourceId', 'description'],
            properties: {
                id: {
                    type: 'integer'
                },
                action: {
                    type: 'string',
                    enum: [Actions.CREATE, Actions.READ, Actions.UPDATE, Actions.DELETE],
                    default: Actions.READ
                },
                description: {
                    type: 'string',
                    maxLength: Permission.DESCRIPTION_MAX_LENGTH
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

    /**
     * Converts the JSON object from the internal to the external format.
     * @memberof Permission
     * @param {Object} json the object in the internal format
     * @return {Object} the object in the external format
     */
    $formatJson(json) {
        const result = super.$formatJson(json);
        result.resource = result.resource ? result.resource.name : undefined;
        return result;
    }
}

/**
 * @type {number}
 */
Permission.DESCRIPTION_MAX_LENGTH = 2048;

module.exports = Permission;
