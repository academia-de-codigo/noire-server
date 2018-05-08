/**
 * Base Model
 * @module
 */
const Model = require('objection').Model;
const SearchQueryBuilder = require('./search');

/**
 * Base Model class from which all models should inherit
 * @class BaseModel
 * @extends {Model}
 */
class BaseModel extends Model {
    /**
     * Gets the query builder associated with this model
     * @readonly
     * @static
     * @memberof BaseModel
     * @returns {SearchQueryBuilder} the custom query builder
     */
    static get QueryBuilder() {
        return SearchQueryBuilder;
    }

    /**
     * Update the created timestamp before each database insert
     * @memberof BaseModel
     */
    $beforeInsert() {
        this.created_at = new Date().toISOString();
    }

    /**
     * Update the updated timestamp before each database update
     * @memberof BaseModel
     */
    $beforeUpdate() {
        this.updated_at = new Date().toISOString();
    }

    /**
     * Remove the created timestamp after each database insert
     * @memberof BaseModel
     */
    $afterInsert() {
        delete this.created_at;
    }

    /**
     * Remove the updated timestamp after each database update
     * @memberof BaseModel
     */
    $afterUpdate() {
        delete this.updated_at;
    }

    /**
     * Remove timestamp fields from the model
     * @memberof BaseModel
     */
    $afterGet() {
        delete this.created_at;
        delete this.updated_at;
    }

    /**
     * Assigns all boolean type properties with boolean values, replacing integer values.
     * Needed due to the values used for boolean datatype in some database engines (sqlite, e.g., uses 0/1)
     * as well as dates.
     * @param {Object} json
     */
    $parseDatabaseJson(json) {
        const result = super.$parseDatabaseJson(json);
        const schema = this.constructor.jsonSchema;

        if (!schema || !schema.properties) {
            return result;
        }

        for (const property of Object.keys(schema.properties)) {
            const key = schema.properties[property];

            if (!key.type) {
                continue;
            }

            if (typeof result[property] === 'number' && key.type === 'boolean') {
                result[property] = result[property] === 1;
            }

            if (typeof result[property] === 'number' && key.type === 'date') {
                result[property] = new Date(result[property]);
            }
        }

        return result;
    }
}

module.exports = BaseModel;

/**
 * Fetch models for relationship mappings from this very same directory
 * @type {Array}
 */
BaseModel.modelPaths = [__dirname];

/**
 * Make sure timestamp fields are persisted despite not part
 * of the {@link http://json-schema.org/|JSON Schema}
 * @type {boolean}
 */
BaseModel.pickJsonSchemaProperties = false;
