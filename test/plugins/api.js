const Lab = require('lab');
const Path = require('path');
const mock = require('mock-require');
const Hapi = require('hapi');
const Api = require(Path.join(process.cwd(), 'lib/plugins/api'));
const Package = require(Path.join(process.cwd(), 'package.json'));

const { after, describe, expect, it } = exports.lab = Lab.script();


describe('Plugin: api', () => {

    const fakeRouteId = 'fake-route';
    const fakeRouteConfig = {
        endpoints: [{
            method: 'GET',
            path: '/',
            config: {
                id: fakeRouteId,
                handler: () => { }
            }
        }]
    };

    after(() => {
        mock.stopAll();
    });

    it('registers the route handlers', async () => {

        // setup
        mock(Path.join(process.cwd(), 'lib/routes/api'), fakeRouteConfig);
        const Api = mock.reRequire(Path.join(process.cwd(), 'lib/plugins/api'));
        const server = Hapi.server();

        // exercise
        await server.register(Api);
        await server.initialize();

        // validate
        expect(server.lookup(fakeRouteId)).be.an.object();
        expect(server.lookup(fakeRouteId).settings).to.be.an.object();
        expect(server.lookup(fakeRouteId).settings.id).to.equals(fakeRouteId);
    });

    it('returns the version from package.json', async () => {

        // setup
        const server = Hapi.server();

        // exercise
        await server.register(Api);
        await server.start();
        const response = await server.inject('/version');

        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal({
            version: Package.version
        });
    });
});
