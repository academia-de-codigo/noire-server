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
