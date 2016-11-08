'use strict';

var Path = require('path');
var Package = require('../../package.json');

var internals = {
    modelsPath: Path.resolve(__dirname, '../models'),
};

internals.createRepository = function(Model) {

    return {

        /*
            Common interface for all repositories
         */

        findAll: function() {
            return Model.query();
        },
        findOne: function(id) {
            return Model.query().findById(id);
        },
        add: function(entity) {
            return Model.query().insert(entity);
        },
        update: function(entity) {
            var id = entity.id;
            delete entity.id;
            return Model.query().patchAndFetchById(id, entity);
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

exports.register.attributes = {
    name: 'repository',
    pkg: Package
};
