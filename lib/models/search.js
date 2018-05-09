/**
 * Search QueryBuilder
 * @module
 */
const QueryBuilder = require('objection').QueryBuilder;

/**
 * Custom query builder class used by all models
 * @class SearchQueryBuilder
 * @extends {QueryBuilder}
 */
class SearchQueryBuilder extends QueryBuilder {
    /**
     * Adds where like clauses to query for all model searchable fields
     * @param {string} criteria the search criteria
     * @returns {SearchQueryBuilder} this query builder for chaining
     * @memberof SearchQueryBuilder
     */
    search(criteria) {
        // nothing to do if no valid criteria argument
        if (!criteria || !typeof criteria === 'string') {
            return this;
        }

        // nothing to do if no search fields defined for model
        if (!this._modelClass.searchFields) {
            return this;
        }

        this._modelClass.searchFields.forEach(field => {
            this.orWhere(field, 'like', `%${criteria}%`);
        });

        return this;
    }
}

module.exports = SearchQueryBuilder;
