'use strict';

var Model = require('objection').Model;

/**
 * Base Model class from which all models should inherit
 */
function BaseModel() {
    Model.apply(this, arguments);
}

Model.extend(BaseModel);
module.exports = BaseModel;

/**
 * Fetch models for relationship mappings from this very same directory
 * @type {Array}
 */
BaseModel.modelPaths = [__dirname];

/**
 * Make sure timestamp fields are persisted despite not part of the schema
 * @type {Boolean}
 */
BaseModel.pickJsonSchemaProperties = false;

/**
 * Update the created timestamp before each database insert
 */
BaseModel.prototype.$beforeInsert = function() {
    this.created_at = new Date().toISOString();
};

/**
 * Update the updated timestamp before each database update
 */
BaseModel.prototype.$beforeUpdate = function() {
    this.updated_at = new Date().toISOString();
};

/**
 * Remove the created timestamp after each database insert
 */
BaseModel.prototype.$afterInsert = function() {
    delete this.created_at;
};

/**
 * Remove the updated timestamp after each database update
 */
BaseModel.prototype.$afterUpdate = function() {
    delete this.updated_at;
};

/**
 * Remove timestamp fields from the model
 */
BaseModel.prototype.$afterGet = function() {
    delete this.created_at;
    delete this.updated_at;
};
