const Manager = require('./utils/manager');
const Config = require('./config');
const Models = require('./models');

const internals = {};

// plugins to register for each connection
// using glue compose api
internals.plugins = {
    web: [
        { plugin: './redirect', options: { tlsRoutes: Config.redirect.tlsOnly } },
        './views',
        './assets',
        './web',
        './route-errors'
    ],
    webTls: [
        { plugin: './redirect', options: { tlsRoutes: Config.redirect.tlsOnly } },
        './views',
        './assets',
        './web-tls',
        './route-errors',
        './auth'
    ],
    api: [
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
                    files: { relativeTo: Config.build.dist },
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

internals.listenerStopHandler = function(server) {
    server.log([server.settings.app.name, 'stop']);
};

const startServer = async function() {

    try {

        const servers = await Manager.start(internals.buildManifests());

        for (let server of Object.values(servers)) {

            // TODO: remove this when good v17 becomes available
            // https://github.com/hapijs/good/issues/568
            server.events.on('log', (event, tags) => {
                console.log('\n' + JSON.stringify(tags) + '\n' + JSON.stringify(event, null, 2));
            });
            server.events.on('request', (request, event, tags) => {
                console.log('\n' + JSON.stringify(tags) + '\n' + JSON.stringify(event, null, 2));
            });

            // TODO: would like to catch server start events in monitor plugin, doc says:
            // event.server - if the event relates to a server, the server.info.uri
            // but that does not seem to be the case.. open issue perhaps?

            // log server start
            server.log(['server', server.settings.app.name, 'start'], server.info.uri);

            // log server end
            server.ext('onPreStop', internals.listenerStopHandler);

        }

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

startServer();
