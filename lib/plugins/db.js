'use strict';

var Objection = require('objection');
var Knex = require('knex');
var Package = require('../../package.json');
var Config = require('../config');
var KnexConfig = require('../../knexfile');

var internals = {};
internals.initialize = function(next) {

    internals.config = KnexConfig[Config.environment];

    /*jshint -W064 */ //
    internals.knex = Knex(internals.config); // eslint-disable-line
    /*jshint +W064 */ //

    internals.knex.raw('select 1+1 as result').then(function(data) {

        var result = data.rows ? data.rows[0].result : data[0].result;
        if (result !== 2) {
            return next('database connection test returned wrong result');
        }

        return next();

    }, function(err) {

        return next(err.message);
    });
};

exports.register = function(server, options, next) {

    internals.initialize(function(err) {

        if (err) {
            server.log(['server', 'db', 'error'], err);
            return next(); // let's start the server anyway...
            //return next(err) // prevent the server from starting with no db
        }

        internals.Model = Objection.Model;
        internals.Model.knex(internals.knex);

        // not really needed, but just in case we want to test
        // some db stuff directly from a controller..
         server.decorate('server', 'db', {
            query: internals.knex,
            model: internals.Model,
        });

        server.ext('onPreStop', function(server, next) {

            server.log(['server', 'db', 'stop']); // server.log not available in onPostStop
            return next();
        });

        server.ext('onPostStop', function(server, next) {

            internals.knex.destroy(function() {

                next();
            });
        });

        server.log(['server', 'db', 'start'], internals.config);
        return next();

    });

};

exports.register.attributes = {
    name: 'db',
    pkg: Package
};
