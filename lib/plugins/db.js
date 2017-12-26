/**
 * Database plugin
 * @module
 */
const Hoek = require('hoek');
const Path = require('path');
const Package = require(Path.join(process.cwd(), 'package.json'));
const Config = require(Path.join(process.cwd(), 'lib/config'));
const KnexConfig = require(Path.join(process.cwd(), 'knexfile'));

setDebug(); // Need to setup environment variables before loading knex

const Objection = require('objection');
const Knex = require('knex');

const internals = {};
internals.initialize = async function() {

    internals.config = KnexConfig[Config.environment];

    // database connecction is required
    Hoek.assert(internals.config.connection, 'no connection configured');

    // database name is required for all but sqlite
    Hoek.assert(internals.config.client.indexOf('sqlite') !== -1 ||
        internals.config.connection.database, 'no database configured');

    /*jshint -W064 */ //
    internals.knex = Knex(internals.config); // eslint-disable-line
    /*jshint +W064 */ //

    return internals.knex.raw('select 1+1 as result').then((data) => {

        const result = data.rows ? data.rows[0].result : data[0].result;
        Hoek.assert(result === 2, 'database connection test returned wrong result');
    });
};

/**
 * Plugin registration function
 * @async
 * @param {Hapi.Server} server the hapi server
 */
const register = async function(server) {

    try {

        await internals.initialize();

    } catch (err) {
        // make sure we log error before exiting
        server.log(['server', 'db', 'error'], err.message);
        throw err;
    }

    internals.Model = Objection.Model;
    internals.Model.knex(internals.knex);

    // not really needed, but just in case we want to test
    // some db stuff directly from a controller..
    server.decorate('server', 'db', {
        query: internals.knex,
        model: internals.Model,
    });

    server.ext('onPreStop', server => {

        server.log(['server', 'db', 'stop']); // server.log not available in onPostStop
    });

    server.ext('onPostStop', () => {

        internals.knex.destroy();
    });

    server.log(['server', 'db', 'start'], internals.config);
};

exports.plugin = {
    name: 'db',
    pkg: Package,
    register
};

function setDebug() {

    const knexConfig = KnexConfig[Config.environment];
    if (typeof knexConfig !== 'object' || !knexConfig.debug) {
        return;
    }

    if (!Config.debug) {
        delete knexConfig.debug;
        return;
    }

    const debugTypes = Object.keys(knexConfig.debug);
    const debug = debugTypes.reduce(function(acc, current, index) {

        if (!knexConfig.debug[current]) {
            return acc;
        }

        if (index > 0) {
            acc += ',';
        }

        return acc + 'knex:' + current;

    }, '');
    process.env.DEBUG = debug;
    delete knexConfig.debug; // not needed, using DEBUG env instead.
}
