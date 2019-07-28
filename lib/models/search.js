/**
 * Search QueryBuilder
 * @module
 */
const Hoek = require('@hapi/hoek');
const QueryBuilder = require('objection').QueryBuilder;

const internals = {};

/**
 * Adds where like clauses to query for all model searchable fields
 * @param {string} criteria the search criteria
 * @returns {SearchQueryBuilder} this query builder for chaining
 */
internals.searchEntity = function(criteria) {
    this._modelClass.searchFields.forEach(field => {
        this.orWhere(field, 'like', `%${criteria}%`);
    });

    return this;
};

/**
 * Searches for all searchable fields in model and related models where value is like criteria.
 * @param {string} criteria the search criteria
 * @param {string|Array.<string>} relations the name of the relations to search in
 * @returns {SearchQueryBuilder} this query builder for chaining
 */
internals.searchEntityWithRelations = function(criteria, relations) {
    const relationNames = Array.isArray(relations) ? relations : [relations];

    return relationNames.reduce((queryBuilder, name) => {
        const relation = queryBuilder._modelClass.getRelations()[name];

        Hoek.assert(relation, 'relation does not exist');
        Hoek.assert(
            relation.ownerModelClass === queryBuilder._modelClass,
            'entity is not the relation owner'
        );

        if (relation.joinModelClass) {
            return internals.queryLinkingTable.call(queryBuilder, { criteria, relation });
        }

        return internals.queryRelatedTable.call(queryBuilder, { criteria, relation });
    }, this);
};

/**
 * Searches for all searchable fields in model and related model where value is like criteria,
 * using the foreign keys in a linking table.
 * @param {string} criteria the search criteria
 * @param {string} relation the name of the relation to search in
 * @returns {SearchQueryBuilder} this query builder for chaining
 */
internals.queryLinkingTable = function({ criteria, relation }) {
    return this.orWhereIn(
        relation.ownerProp._props, // owner PK
        relation.joinModelClass
            .query()
            .whereIn(
                relation.joinTableOwnerProp._props, // FK referencing owner
                relation.ownerModelClass
                    .query()
                    .search(criteria)
                    .select(relation.ownerProp._props) // owner PK
            )
            .orWhereIn(
                relation.joinTableRelatedProp._props, // FK referencing related
                relation.relatedModelClass
                    .query()
                    .search(criteria)
                    .select(relation.relatedProp._props) // related PK
            )
            .select(relation.joinTableOwnerProp._props) // FK referencing owner
    );
};

/**
 * Searches for all searchable fields in model and related model where value is like criteria,
 * using the foreign key in the related model table.
 * @param {string} criteria the search criteria
 * @param {string} relation the name of the relation to search in
 * @returns {SearchQueryBuilder} this query builder for chaining
 */
internals.queryRelatedTable = function({ criteria, relation }) {
    return this.search(criteria).orWhereIn(
        relation.ownerProp._props, // owner PK
        relation.relatedModelClass
            .query()
            .search(criteria)
            .select(relation.relatedProp._props) // FK referencing owner
    );
};

/**
 * Custom query builder class used by all models
 * @class SearchQueryBuilder
 * @extends {QueryBuilder}
 */
class SearchQueryBuilder extends QueryBuilder {
    /**
     * Adds where like clauses to query for all model searchable fields
     * @param {string} criteria the search criteria
     * @param {string|Array.<string>} [relations] the name of the relations to search in
     * @returns {SearchQueryBuilder} this query builder for chaining
     * @memberof SearchQueryBuilder
     */
    search(criteria, relations) {
        // nothing to do if no valid criteria argument
        if (!criteria || !typeof criteria === 'string') {
            return this;
        }

        // nothing to do if no search fields defined for model
        if (!this._modelClass.searchFields) {
            return this;
        }

        const query = relations ? internals.searchEntityWithRelations : internals.searchEntity;

        // exclude unwanted results if query building operations have already been added
        // do this only once by adding state to query builder operations to mark it as read
        this._operations.length && !this._operations.hasBeenRead
            ? this.whereIn(
                  `${this._modelClass.tableName}.${this._modelClass.idColumn}`,
                  query
                      .call(this._modelClass.query(), criteria, relations)
                      .select(`${this._modelClass.tableName}.${this._modelClass.idColumn}`)
              )
            : query.call(this, criteria, relations);

        this._operations.hasBeenRead = true;
        return this;
    }
}

module.exports = SearchQueryBuilder;
