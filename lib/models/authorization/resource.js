/**
 * Resource Model
 */
const BaseModel = require('models/base');

/**
 * Resource model class
 * @class Resource
 * @extends {BaseModel}
 */
class Resource extends BaseModel {
    /**
     * Gets the database table name
     * @readonly
     * @static
     * @memberof Resource
     * @returns {string} the database table name
     */
    static get tableName() {
        return 'resources';
    }

    /**
     * Get the model properties to perform search on
     * @readonly
     * @static
     * @memberof Resource
     * @returns {Array.<string>} the model properties
     */
    static get searchFields() {
        return ['name'];
    }

    /**
     * Get the model properties to hide when converting to JSON
     * @readonly
     * @static
     * @memberof Resource
     * @returns {Array.<string>} the model properties
     */
    static get hiddenFields() {
        return ['id'];
    }

    /**
     * Get the json schema for model validation
     * @readonly
     * @static
     * @memberof Resource
     * @returns {Object} the json schema
     */
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'description'],
            properties: {
                id: {
                    type: 'integer'
                },
                description: {
                    type: 'string',
                    maxLength: Resource.DESCRIPTION_MAX_LENGTH
                },
                name: {
                    type: 'string'
                }
            }
        };
    }

    /**
     * Gets the model relations
     * @readonly
     * @static
     * @memberof Resource
     * @returns {Object} the model relations
     */
    static get relationMappings() {
        return {
            permissions: {
                relation: BaseModel.HasManyRelation,
                modelClass: 'authorization/permission',
                join: {
                    from: 'permissions.resourceId',
                    to: 'resources.id'
                }
            }
        };
    }
}

module.exports = Resource;

/**
 * @type {number}
 */
Resource.NAME_MIN_LENGTH = 3;

/**
 * @type {number}
 */
Resource.NAME_MAX_LENGTH = 16;

/**
 * @type {number}
 */
Resource.DESCRIPTION_MAX_LENGTH = 2048;

/**
 * Default limit for number of rows returned
 * @type {number}
 */
Resource.LIMIT_DEFAULT = 10;
