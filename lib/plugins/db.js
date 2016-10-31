'use strict';

var Objection = require('objection');
var Knex = require('knex');
var Package = require('../../package.json');
var Config = require('../config');

var internals = {};
internals.initialize = function(next) {

    /*jshint -W064 */ //
    internals.knex = Knex(Config.db); // eslint-disable-line
    /*jshint +W064 */ //

    internals.knex.raw('select 1+1 as result').then(function(data) {

        if (data.rows[0].result !== 2) {
            return next('connection test returned wrong result');
        }

        if (next) {
            return next();
        }

    }, function(err) {

        return next(err.message);
    });
};

exports.register = function(server, options, next) {

    internals.initialize(function(err) {

        if (err) {
            server.log(['server', 'db', 'error'], err);
            return next();
        }


        internals.Model = Objection.Model;
        internals.Model.knex(internals.knex);

        server.decorate('server', 'dbQuery', internals.knex);
        server.decorate('server', 'dbModel', internals.Model);

        server.ext('onPreStop', function(server, next) {

            server.log(['server', 'db', 'stop']); // server.log not available in onPostStop
            return next();
        });

        server.ext('onPostStop', function(server, next) {

            internals.knex.destroy(function() {

                next();
            });
        });

        server.log(['server', 'db', 'start'], Config.db);
        return next();

    });

};

exports.register.attributes = {
    name: 'db',
    pkg: Package
};
