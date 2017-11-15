const Manager = require('./utils/manager');
const Config = require('./config');

const internals = {};
internals.manifests = [{
    server: {
        app: {
            name: 'web',
        },
        host: Config.connections.web.host,
        port: Config.connections.web.port
    }
}, {
    server: {
        app: {
            name: 'web-tls',
        },
        host: Config.connections.webTls.host,
        port: Config.connections.webTls.port
    }
}, {
    server: {
        app: {
            name: 'api',
        },
        host: Config.connections.api.host,
        port: Config.connections.api.port
    }
}];

internals.listenerStopHandler = function(server) {
    server.log([server.settings.app.name, 'stop']);
};

const startServer = async function() {

    try {

        const servers = await Manager.start(internals.manifests);

        // hapi servers
        const web = servers['web'];
        const webTls = servers['web-tls'];
        const api = servers['api'];

        // Logging started servers
        // TODO: would like to catch server start events in monitor plugin, doc says:
        // event.server - if the event relates to a server, the server.info.uri
        // but that does not seem to be the case.. open issue perhaps?
        web.log(['server', 'web', 'start'], web.info.uri);
        webTls.log(['server', 'web-tls', 'start'], webTls.info.uri);
        api.log(['server', 'api', 'start'], api.info.uri);

        // Logging stopped servers
        web.ext('onPreStop', internals.listenerStopHandler);
        webTls.ext('onPreStop', internals.listenerStopHandler);
        api.ext('onPreStop', internals.listenerStopHandler);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

startServer();
