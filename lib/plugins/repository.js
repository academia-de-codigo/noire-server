/**
 * Repository plugin
 * @module
 */
const Hoek = require('hoek');
const Path = require('path');
const Objection = require('objection');
const Package = require('package.json');
const BaseModel = require('models/base');

const internals = {
    modelsPath: 'models'
};

// limit default for rows returned when using findAll if Model does not provide one
internals.LIMIT_DEFAULT = 100;

// The bellow query parameters will build a criteria object for
// querying the db for the second set of 100 records containing
// { limit: 100, page: 2, search: 'admin', sort: '-name,+email,id' }
internals.buildCriteria = function(Model, queryParams = {}) {
    const criteria = {};
    criteria.limit = queryParams.limit || Model.LIMIT_DEFAULT || internals.LIMIT_DEFAULT;
    criteria.page = queryParams.page || 1;
    criteria.search = queryParams.search;

    if (queryParams.sort) {
        // split all sorting fields up to a maximum of 5
        criteria.sort = queryParams.sort.split(',', 5).map(param => ({
            field: param.match(/^(\+|-)/) ? param.substring(1) : param,
            order: param.startsWith('-') ? 'desc' : 'asc'
        }));
    }
    return criteria;
};

/**
 * Plugin registration function
 * @param {Hapi.Server} server the hapi server
 * @param {Object} options the plugin registration options
 */
const register = function(server, options) {
    if (!options.models) {
        return;
    }

    const models = {};

    // attach each model to this module for easy consuption by services
    options.models.forEach(model => {
        models[model] = exports.create(model);
        server.logger().debug({ plugin: exports.plugin.name, model });
    });

    server.decorate('server', 'models', models);

    server
        .logger()
        .child({ plugin: exports.plugin.name })
        .debug('started');
};

/**
 * Class representing a Repository for a specific model
 */
exports.ModelRepository = class {
    /**
     * Create a new Repository
     * @param {Objection.Model} Model the model to create the repository for
     */
    constructor(Model) {
        Hoek.assert(Model.prototype instanceof BaseModel || Model.transaction, 'invalid model');
        this.model = Model;
    }

    /**
     * Returns all instances of the provided type
     * @param {Object} [queryParams] the query parameters
     * @returns {Objection.QueryBuilder} the associated query
     */
    findAll(queryParams) {
        const criteria = internals.buildCriteria(this.model, queryParams);
        return this.model
            .query()
            .limit(criteria.limit)
            .offset((criteria.page - 1) * criteria.limit)
            .search(criteria.search) // uses custom SearchQueryBuilder
            .modify(query => {
                if (criteria.sort) {
                    criteria.sort.forEach(param => {
                        query.orderBy(param.field, param.order);
                    });
                }
            });
    }

    /**
     * Retrieves an entity by its id
     * @param {number} id the entity id
     * @returns {Objection.QueryBuilder} the associated query
     */
    findOne(id) {
        return this.model.query().findById(id);
    }

    /**
     * Saves the given entity
     * @param {Objection.Model} entity the entity to save
     * @returns {Objection.QueryBuilder} the associated query
     */
    add(entity) {
        return this.model.query().insert(entity);
    }

    /**
     * Updates an existing entity
     * @param {Objection.Model} instance the entity to update
     * @returns {Objection.QueryBuilder} the associated query
     */
    update(entity) {
        return entity.$query().updateAndFetch();
    }

    /**
     * Removes an existing entity by its id
     * @param {number} id the entity id
     * @returns {Objection.QueryBuilder} the associated query
     */
    remove(id) {
        return this.model.query().deleteById(id);
    }

    /**
     * Counts the number of entity instances
     * @param {Object} [queryParams] the query parameters
     * @returns {Objection.QueryBuilder} the associated query
     */
    count(criteria) {
        const countQuery = this.model.query().count('* as count');

        if (typeof criteria === 'object' && criteria.search) {
            // aliasing with `as` is required for subquerying: http://knexjs.org/#Builder-as
            countQuery.from(
                this.model
                    .query()
                    .search(criteria.search)
                    .as('ignored_alias')
            );
        }

        return countQuery.first();
    }

    /**
     * Creates a query for the model
     * @returns {Objection.QueryBuilder} the model query
     */
    query() {
        return this.model.query();
    }
};

/**
 * Creates a new repository for a model
 * @param {string} model the model name
 * @returns {ModelRepository} the created repository
 */
exports.create = function(model) {
    // fetch model from disk
    const Model = require(Path.join(internals.modelsPath, model));

    // models must extend from base model
    Hoek.assert(Model.prototype instanceof BaseModel, `invalid model ${model}`);

    // create a new repository for this model
    exports[model] = new exports.ModelRepository(Model);
    return exports[model];
};

/**
 * Binds a set of model repositories to a transaction
 * @async
 * @example
 * Repository.tx(UserModel, RoleModel, (userTxRepo, roleTxRepo) => {
 *     // both remove operations are executed on a db transaction
 *     txUserRepo.remove(1);
 *     txRoleRepo.remove(1);
 * });
 * @returns {Promise} resolved if the transaction was committed with success
 */
exports.tx = async function() {
    // there must be at least one model class and the callback
    Hoek.assert(arguments.length > 1, 'missing model to bind transaction to');

    // grab the callback function from the arguments
    const next = arguments[arguments.length - 1];

    // construct a new set of arguments with a new callback
    const newArgs = Array.prototype.slice.call(arguments, 0, arguments.length - 1); // removes cb
    newArgs.push((...args) => {
        // called by orm

        // obtain transacting repositories from orm
        const txRepos = Array.prototype.map.call(
            args,
            txModel => new exports.ModelRepository(txModel)
        );

        // invoke the original callback with transactional binded repos
        return next.apply(null, txRepos);
    });

    // bind models to transaction
    return Objection.transaction.apply(null, newArgs);
};

exports.plugin = {
    register: register,
    name: 'repository',
    pkg: Package
};
