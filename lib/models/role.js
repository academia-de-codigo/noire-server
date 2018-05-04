/**
 * Role Model
 */
const BaseModel = require('models/base');

/**
 * Role model class
 * @class Role
 * @extends {BaseModel}
 */
class Role extends BaseModel {
    /**
     * Gets the database table name
     * @readonly
     * @static
     * @memberof Role
     * @returns {string} the database table name
     */
    static get tableName() {
        return 'roles';
    }

    /**
     * Get the model properties to perform search on
     * @readonly
     * @static
     * @memberof Role
     * @returns {Array.<string>} the model properties
     */
    static get searchFields() {
        return ['name', 'description'];
    }

    /**
     * Get the json schema for model validation
     * @readonly
     * @static
     * @memberof Role
     * @returns {Object} the json schema
     */
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name'],
            properties: {
                id: {
                    type: 'integer'
                },
                name: {
                    type: 'string',
                    minLength: Role.NAME_MIN_LENGTH,
                    maxLength: Role.NAME_MAX_LENGTH
                },
                description: {
                    type: 'string',
                    maxLength: Role.DESC_MAX_LENGTH
                }
            }
        };
    }

    /**
     * Gets the model relations
     * @readonly
     * @static
     * @memberof Role
     * @returns {Object} the model relations
     */
    static get relationMappings() {
        return {
            users: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: 'user',
                join: {
                    from: 'roles.id',
                    // ManyToMany relation needs `through` object to describe the join table
                    through: {
                        from: 'users_roles.role_id',
                        to: 'users_roles.user_id'
                    },
                    to: 'users.id'
                }
            },
            permissions: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: 'permission',
                join: {
                    from: 'roles.id',
                    through: {
                        from: 'roles_permissions.role_id',
                        to: 'roles_permissions.permission_id'
                    },
                    to: 'permissions.id'
                }
            }
        };
    }
}

module.exports = Role;

/**
 * @type {number}
 */
Role.NAME_MIN_LENGTH = 3;

/**
 * @type {number}
 */
Role.NAME_MAX_LENGTH = 16;

/**
 * @type {number}
 */
Role.DESC_MAX_LENGTH = 1024;

/**
 * Default limit for number of rows returned
 * @type {number}
 */
Role.LIMIT_DEFAULT = 10;
