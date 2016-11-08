'use strict';

var Role = require('./models/role');
var User = require('./models/user');

var internals = {};

internals.models = {
    role: Role,
    user: User
};

internals.add = function(Model) {

    exports[Model.tableName] = {

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

exports.registerModels = function(server) {
    Object.keys(internals.models).forEach(function(model) {
        internals.add(internals.models[model]);
        server.log(['server', 'db', 'model', 'debug'], model);
    });
};
