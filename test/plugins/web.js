const Lab = require('lab');
const Sinon = require('sinon');
const mock = require('mock-require');
const Hapi = require('hapi');
const Package = require('package.json');
const Logger = require('test/fixtures/logger-plugin');

const { before, after, describe, expect, it } = (exports.lab = Lab.script());

describe('Plugin: web', () => {
    const fakeRouteId = 'fake-route';
    const fakeRouteConfig = {
        endpoints: [
            {
                method: 'GET',
                path: '/',
                config: {
                    id: fakeRouteId,
                    handler: () => {}
                }
            }
        ]
    };

    let Web;

    before(() => {
        mock('routes/web', fakeRouteConfig);
        Web = mock.reRequire('plugins/web');
    });

    after(() => {
        mock.stopAll();
    });

    it('registers the view handler', async () => {
        // setup
        const fakeViewsPlugin = { name: 'views', pkg: Package, register: function() {} };
        const server = Hapi.server();
        const viewsStub = Sinon.stub().returns({
            registerHelper: () => {}
        });
        server.decorate('server', 'views', viewsStub);
        server.register(Logger);

        // exercise
        await server.register([fakeViewsPlugin, Web]);
        await server.initialize();

        // validate
        expect(viewsStub.calledOnce).to.be.true();
    });

    it('registers the route handlers', async () => {
        // setup
        const fakeViewsPlugin = {
            name: 'views',
            pkg: Package,
            register: server => {
                server.decorate('server', 'views', () => ({
                    registerHelper: () => {}
                }));
            }
        };
        const server = Hapi.server();
        server.register(Logger);

        // exercise
        await server.register([fakeViewsPlugin, Web]);
        await server.initialize();

        // validate
        expect(server.lookup(fakeRouteId)).be.an.object();
        expect(server.lookup(fakeRouteId).settings).to.be.an.object();
        expect(server.lookup(fakeRouteId).settings.id).to.equals(fakeRouteId);
    });
});
