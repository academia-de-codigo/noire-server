const Fs = require('fs');
const Manager = require('utils/manager');
const ConfigValidation = require('utils/config-validation');
const Config = require('config');
const Models = require('models');
const Logger = require('plugins/logger');

const internals = {};

// plugins to register for each connection using the glue compose api
internals.plugins = [
    './logger',
    './db',
    { plugin: './repository', options: { models: Models } },
    './auth',
    { plugin: './api', routes: { prefix: Config.prefixes.api } },
    './docs',
    './pagination',
    './mailer'
];

internals.buildManifest = function() {
    const tls = {
        key: Fs.readFileSync(Config.tls.key),
        cert: Fs.readFileSync(Config.tls.cert)
    };

    return {
        server: {
            app: { name: 'api' },
            host: Config.api.host,
            port: Config.api.port,
            tls: Config.api.tls ? tls : undefined,
            routes: {
                cors: Config.api.cors ? { origin: Config.api.cors } : undefined
            },
            router: {
                isCaseSensitive: false,
                stripTrailingSlash: true
            }
        },
        register: { plugins: internals.plugins || [] }
    };
};

const start = async function() {
    try {
        ConfigValidation.validate(Config);

        // start servers
        internals.servers = await Manager.start(internals.buildManifest());
    } catch (err) {
        Logger.getLogger().error(err);
        process.exit(1);
    }
};

start();
