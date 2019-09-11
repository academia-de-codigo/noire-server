/**
 * Noire server manager
 * @module
 */
const Fs = require('fs');
const Glue = require('@hapi/glue');
const Hoek = require('@hapi/hoek');
const Exiting = require('exiting');
const Config = require('config');
const ConfigValidation = require('utils/config-validation');

const internals = {
    pluginsPath: 'plugins'
};

internals.relativizePluginPath = plugins =>
    plugins.map(plugin =>
        typeof plugin === 'string'
            ? `./${plugin}`
            : plugin.plugin
            ? { ...plugin, plugin: `./${plugin.plugin}` }
            : plugin
    );

internals.readCertificates = () => ({
    key: Fs.readFileSync(Config.tls.key),
    cert: Fs.readFileSync(Config.tls.cert)
});

// check https://github.com/hapijs/glue/blob/master/API.md for manifest syntax
internals.buildManifest = plugins => ({
    server: {
        app: { name: 'api' },
        host: Config.api.host,
        port: Config.api.port,
        tls: Config.api.tls ? internals.readCertificates() : undefined,
        routes: {
            cors: Config.api.cors
                ? {
                      additionalExposedHeaders: ['Content-Range', 'Link'],
                      origin: Config.api.cors
                  }
                : false
        },
        router: {
            isCaseSensitive: false,
            stripTrailingSlash: true
        }
    },
    register: { plugins: plugins ? internals.relativizePluginPath(plugins) : [] }
});

/**
 * Starts the noire server
 * @async
 * @param {Array.<(Object|string)>} plugins plugins to register
 * @returns {Object.<Hapi.Server>} the hapi server
 */
exports.start = async function(plugins) {
    ConfigValidation.validate(Config);

    // create a new hapi server
    const server = await Glue.compose(
        internals.buildManifest(plugins),
        {
            relativeTo: internals.pluginsPath
        }
    );

    Hoek.assert(server.settings.app, 'server settings should not be empty');

    // get the server name
    const connection = server.settings.app.name;
    Hoek.assert(connection, 'server requires a name setting');

    // create a new exiting manager for all the hapi servers
    internals.manager = Exiting.createManager(server);
    await internals.manager.start();

    return server;
};

/**
 * Stops the noire server
 * @async
 */
exports.stop = async function() {
    if (internals.manager) {
        await internals.manager.stop();
    }
};

/**
 * Gets the noire server status
 * ['starting', 'started', 'stopping', 'prestopped', 'stopped', 'startAborted', 'errored', 'timeout']
 * @returns {string} the server process status
 */
exports.getState = function() {
    return internals.manager ? internals.manager.state : 'stopped';
};

/**
 * Resets the noire server, used mainly for testing purposes
 */
exports.reset = async function() {
    if (internals.manager && internals.manager.state === 'started') {
        internals.manager.stop();
    }

    Exiting.reset();

    internals.manager = null;
};
