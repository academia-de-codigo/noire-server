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

    // attach each model repository to this module for easy consumption by services
    options.models.forEach(model => {
        const repo = exports.create(model);
        const { name } = repo.model;

        models[name] = repo;
        exports[name] = repo;

        server.logger().debug({ plugin: exports.plugin.name, model: name });
    });

    server.decorate('request', 'model', models);

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
    exports[Model.name] = new exports.ModelRepository(Model);
    return exports[Model.name];
};

/**
 * Binds a set of model repositories to a transaction
 * @async
 * @example
 * Repository.tx([UserModel, RoleModel], (userTxRepo, roleTxRepo) => {
 *     // both remove operations are executed on a newly created db transaction
 *     txUserRepo.remove(1);
 *     txRoleRepo.remove(1);
 * });
 *
 * @async
 * @param {Objection.Model|Objection.Model[])} the models to create transaction bounded repositories
 * @param {Function)} cb callback function to call with transaction bounded repositories
 * @param {Knex.Transaction} [trx] optional transaction to bind repositories to
 * @returns {Promise} resolved if the transaction was committed with success
 */
exports.tx = async function(models, cb, trx) {
    models = Array.isArray(models) ? models : [models];

    Hoek.assert(models.length > 0, 'missing models to bind transaction');

    models.forEach(model =>
        Hoek.assert(model.prototype instanceof BaseModel, `invalid model ${model}`)
    );

    Hoek.assert(typeof cb === 'function', 'missing transaction callback');
    Hoek.assert(!trx || trx.commit, 'invalid transaction object');

    // adds a new callback, to be invoked by the orm after binding models to transaction
    const next = (...args) => {
        // obtain transacting repositories from orm
        const txRepos = args.map(txModel => new exports.ModelRepository(txModel));

        // invoke the original callback with transactional bounded repos
        return cb.apply(null, txRepos);
    };

    // use a brand new transaction
    if (!trx) {
        return Objection.transaction.apply(null, [...models, next]);
    }

    // bind models to existing transaction
    const txModels = models.map(model => model.bindTransaction(trx));
    return next.apply(trx, txModels);
};

/**
 * Performs some work in the context of a new transaction
 * @async
 * @param {Function} work callback function to be invoked with a new transaction
 * @returns {Promise} resolved if work completed successfully
 */
exports.doTx = async function(work) {
    return new Promise(async (resolve, reject) => {
        let trx;

        try {
            trx = await Objection.transaction.start(BaseModel.knex());

            const result = await work(trx);

            await trx.commit();

            resolve(result);
        } catch (error) {
            await trx.rollback(error);
            reject(error);
        }
    });
};

exports.plugin = {
    register: register,
    name: 'repository',
    pkg: Package
};
