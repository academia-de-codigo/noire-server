'use strict';

var Path = require('path');
var Objection = require('objection');
var Package = require('../../package.json');

var internals = {
    modelsPath: Path.resolve(__dirname, '../models'),
};

internals.createRepository = function(Model) {

    return {

        /*
            Common interface for all repositories
         */

        model: Model,
        findAll: function() {
            return Model.query();
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

    // attach each model to this module for easy consuption by services
    options.models.forEach(function(model) {

        var Model = require(Path.resolve(internals.modelsPath, model));

        exports[model] = models[model] = internals.createRepository(Model);
        server.log(['server', 'db', 'model', 'debug'], model);
    });

    server.decorate('server', 'models', models);
    next();
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