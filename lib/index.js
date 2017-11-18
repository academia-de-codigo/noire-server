const Manager = require('./utils/manager');
const Config = require('./config');

const internals = {};

internals.plugins = {
    web: ['./views', './assets', './web']
};

internals.buildManifests = function() {

    return Object.keys(Config.connections).reduce((manifests, name) => {

        manifests.push({
            server: {
                app: { name },
                host: Config.connections[name].host,
                port: Config.connections[name].port,
                routes: {
                    files: { relativeTo: Config.build.dist }
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
                console.log(tags, JSON.stringify(event));
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
