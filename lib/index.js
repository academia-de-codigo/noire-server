const Path = require('path');
const DotEnv = require('dotenv');
const Manager = require('utils/manager');
const Mailer = require('utils/mailer');
const Config = require('config');
const Models = require('models');
const Logger = require('plugins/logger');

const internals = {};

// plugins to register for each connection using the glue compose api
internals.plugins = {
    web: [
        './logger',
        { plugin: './redirect', options: { tlsRoutes: Config.redirect.tlsOnly } },
        './views',
        './assets',
        './web',
        './route-errors'
    ],
    webTls: [
        './logger',
        { plugin: './redirect', options: { tlsRoutes: Config.redirect.tlsOnly } },
        './views',
        './assets',
        './web-tls',
        './route-errors',
        './auth'
    ],
    api: [
        './logger',
        './db',
        { plugin: './repository', options: { models: Models } },
        './auth',
        { plugin: './api', routes: { prefix: Config.prefixes.api } },
        './docs',
        './pagination'
    ]
};

internals.buildManifests = function() {
    return Object.keys(Config.connections).reduce((manifests, name) => {
        // do not create a manifest for disabled connections
        if (!Config.connections[name].enabled) {
            return manifests;
        }

        manifests.push({
            server: {
                app: { name },
                host: Config.connections[name].host,
                port: Config.connections[name].port,
                tls: Config.connections[name].tls ? Config.tls : undefined,
                routes: {
                    files: { relativeTo: Path.join(process.cwd(), Config.build.dist) },
                    cors: Config.connections[name].cors
                        ? {
                              origin: Config.connections[name].cors
                          }
                        : undefined
                },
                router: {
                    isCaseSensitive: false,
                    stripTrailingSlash: true
                }
            },
            register: { plugins: internals.plugins[name] || [] }
        });

        return manifests;
    }, []);
};

internals.sourceEnvironment = function() {
    const env = DotEnv.config({ path: Config.env });

    if (env.error) {
        throw env.error;
    }
};

const start = async function() {
    try {
        // read environment variables
        internals.sourceEnvironment();

        await Mailer.init();

        // start servers
        internals.servers = await Manager.start(internals.buildManifests());
    } catch (err) {
        Logger.getLogger().error(err);
        process.exit(1);
    }
};

start();
