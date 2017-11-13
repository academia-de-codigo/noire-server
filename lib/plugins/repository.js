const Path = require('path');
const Objection = require('objection');
const Package = require('../../package.json');

const internals = {
    modelsPath: Path.resolve(__dirname, '../models'),
};

// limit default for rows returned when using findAll if Model does not provide one
internals.LIMIT_DEFAULT = 100;

internals.buildCriteria = function(Model, searchCriteria) {

    searchCriteria = searchCriteria || {};
    if (typeof searchCriteria === 'number') {
        searchCriteria = {
            limit: searchCriteria
        };
    }

    if (typeof searchCriteria === 'string') {
        searchCriteria = {
            sort: searchCriteria
        };
    }

    searchCriteria = {
        limit: searchCriteria.limit || Model.LIMIT_DEFAULT || internals.LIMIT_DEFAULT,
        page: searchCriteria.page || 1,
        sort: searchCriteria.sort || '',
        descending: searchCriteria.descending ? 'desc' : 'asc'
    };

    return searchCriteria;
};

/**
 * Plugin registration function
 * @async
 * @param {Hapi.Server} server the hapi server
 * @param {Object} options the plugin registration options
 */
const register = async function(server, options) {

    if (!options.models) {
        return;
    }

    const models = {};

    // attach each model to this module for easy consuption by services
    options.models.forEach((model) => {

        models[model] = exports.create(model);
        server.log(['server', 'db', 'model', 'debug'], model);
    });

    server.decorate('server', 'models', models);
};

/**
 * Class representing a Repository for a specific model
 */
exports.ModelRepository = class {

    /**
     * Create a new Repository for a specific Model type
     * @param {Objection.Model} Model the model to create the repository for
     */
    constructor(Model) {
        this.model = Model;
    }

    /**
     * Finds all records using the provided search criteria
     * @param {(number|string|Object)} searchCriteria the search criteria
     * @returns {Objection.QueryBuilder} the associated query
     */
    findAll(searchCriteria) {

        const criteria = internals.buildCriteria(this.model, searchCriteria);
        return this.model.query()
            .limit(criteria.limit)
            .offset((criteria.page - 1) * criteria.limit)
            .orderBy(criteria.sort, criteria.descending);
    }

    /**
     * Finds the specific record by its id
     * @param {number} id the record id
     * @returns {Objection.QueryBuilder} the associated query
     */
    findOne(id) {
        return this.model.query().findById(id);
    }

    /**
     * Inserts a new record
     * @param {Objection.Model} entity the entity to insert
     * @returns {Objection.QueryBuilder} the associated query
     */
    add(entity) {
        return this.model.query().insert(entity);
    }

    /**
     * Updates an existing record
     * @param {Objection.Model} instance the model instance to update
     * @returns {Objection.QueryBuilder} the associated query
     */
    update(instance) {
        return instance.$query().updateAndFetch();
    }

    /**
     * Removes an existing record by its id
     * @param {number} id the record id
     * @returns {Objection.QueryBuilder} the associated query
     */
    remove(id) {
        return this.model.query().deleteById(id);
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
 * Creates a new model
 * @param {string} model the model name
 * @returns {ModelRepository} the created repository
 */
exports.create = function(model) {

    // fetch model from disk
    const Model = require(Path.resolve(internals.modelsPath, model));

    // create a new repository for this model
    exports[model] = new exports.ModelRepository(Model);
    return exports[model];
};

exports.tx = function() {

    // grab the callback function from the arguments
    const next = arguments[arguments.length - 1];

    // construct a new set of arguments with a new callback
    const newArgs = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
    newArgs.push(function() {

        // obtain transacting repositories from orm
        const txRepos = Array.prototype.map.call(arguments, function(txModel) {
            return internals.createRepository(txModel);
        });

        // invoke the original callback
        return next.apply(null, txRepos);

    });

    // perform transaction
    return Objection.transaction.apply(null, newArgs);
};

exports.plugin = {
    register: register,
    name: 'repository',
    pkg: Package
};
