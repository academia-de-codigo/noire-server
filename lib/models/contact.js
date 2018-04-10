/**
 * Contact Model
 */
const BaseModel = require('models/base');

/**
 * Contact model class
 * @class Contact
 * @extends {BaseModel}
 */
class Contact extends BaseModel {
    /**
     * Gets the database table name
     * @readonly
     * @static
     * @memberof Contact
     * @returns {string} the database table name
     */
    static get tableName() {
        return 'contacts';
    }

    /**
     * Get the model properites to perform search on
     * @readonly
     * @static
     * @memberof Contact
     * @returns {Array.<string>} the model properties
     */
    static get searchFields() {
        return ['email'];
    }

    /**
     * Get the json schema for model validation
     * @readonly
     * @static
     * @memberof Contact
     * @returns {Object} the json schema
     */
    static get jsonSchema() {
        return {
            type: 'object',
            require: ['email', 'confirmed'],
            properties: {
                id: {
                    type: 'integer'
                },
                email: {
                    type: 'string',
                    format: 'email'
                },
                confirmed: {
                    type: 'boolean'
                }
            }
        };
    }
}

module.exports = Contact;

/**
 * Default limit for number of rows returned
 * @type {number}
 */
Contact.LIMIT_DEFAULT = 50;
