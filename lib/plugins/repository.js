var Path = require('path');
var Objection = require('objection');
var Package = require('../../package.json');

var internals = {
    modelsPath: Path.resolve(__dirname, '../models'),
};

// limit default for rows returned when using findAll if Model does not provide one
var LIMIT_DEFAULT = 100;

internals.createRepository = function(Model) {

    return {

        /*
            Common interface for all repositories
         */
        model: Model,
        findAll: function(searchOptions) {

            var criteria = buildCriteria(Model, searchOptions);

            return Model.query()
                .limit(criteria.limit)
                .offset((criteria.page - 1) * criteria.limit)
                .orderBy(criteria.sort, criteria.descending);
        },
        findOne: function(id) {
            return Model.query().findById(id);
        },
        add: function(entity) {
            return Model.query().insert(entity);
        },
        update: function(instance) {
            return instance.$query().updateAndFetch();
        },
        remove: function(id) {
            return Model.query().deleteById(id);
        },
        query: function() {
            return Model.query();
        }
    };
};

exports.register = function(server, options, next) {

    var models = {};

    if (options.models) {

        // attach each model to this module for easy consuption by services
        options.models.forEach(function(model) {

            models[model] = exports.create(model);
            server.log(['server', 'db', 'model', 'debug'], model);
        });
    }

    server.decorate('server', 'models', models);
    next();
};

exports.create = function(model) {

    var Model = require(Path.resolve(internals.modelsPath, model));

    exports[model] = internals.createRepository(Model);
    return exports[model];
};

exports.tx = function() {

    // grab the callback function from the arguments
    var next = arguments[arguments.length - 1];

    // construct a new set of arguments with a new callback
    var newArgs = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
    newArgs.push(function() {

        // obtain transacting repositories from orm
        var txRepos = Array.prototype.map.call(arguments, function(txModel) {
            return internals.createRepository(txModel);
        });

        // invoke the original callback
        return next.apply(null, txRepos);

    });

    // perform transaction
    return Objection.transaction.apply(null, newArgs);

};

exports.register.attributes = {
    name: 'repository',
    pkg: Package
};

function buildCriteria(Model, searchOptions) {

    if (!searchOptions) {
        searchOptions = {};
    }

    if (typeof searchOptions === 'number') {
        searchOptions = {
            limit: searchOptions
        };
    }

    if (typeof searchOptions === 'string') {
        searchOptions = {
            sort: searchOptions
        };
    }

    searchOptions = {
        limit: searchOptions.limit || Model.LIMIT_DEFAULT || LIMIT_DEFAULT,
        page: searchOptions.page || 1,
        sort: searchOptions.sort || '',
        descending: searchOptions.descending ? 'desc' : 'asc'
    };

    return searchOptions;
}
