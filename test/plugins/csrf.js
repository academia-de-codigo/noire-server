const Lab = require('lab');
const Hapi = require('hapi');
const Csrf = require('plugins/csrf');
const Logger = require('test/fixtures/logger-plugin');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Plugin: csrf', () => {
    let server;

    beforeEach(async () => {
        server = Hapi.server();
        server.register(Logger);
        await server.register(Csrf);
    });

    it('handles crumb plugin registration failure', async flags => {
        // cleanup
        let csrfRegister = Csrf.plugin.register;
        flags.onCleanup = function() {
            Csrf.plugin.register = csrfRegister;
        };

        // setup
        const server = Hapi.server();
        const PLUGIN_ERROR = 'plugin error';
        Csrf.plugin.register = async function() {
            throw new Error(PLUGIN_ERROR);
        };

        // exercise and validate
        await expect(server.register(Csrf)).to.reject(PLUGIN_ERROR);
    });

    it('does not serve crumb endpoint if not api server', async () => {
        // exercise
        const response = await server.inject('/generate');

        // validate
        expect(response.statusCode).to.equals(404);
        expect(response.statusMessage).to.equals('Not Found');
    });

    it('serves crumb endpoint if api server', async () => {
        // setup
        const server = Hapi.server({ app: { name: 'api' } });
        server.register(Logger);
        await server.register(Csrf);

        // exercise
        const response = await server.inject('/generate');

        // validate
        expect(response.statusCode).to.equals(200);
        expect(response.payload).to.be.a.string();
        expect(response.result).to.be.an.object();
        expect(response.result.crumb).to.be.a.string();
    });

    it('handles missing crumb headers on post request', async () => {
        // setup
        const fakeRoute = { path: '/login', method: 'POST', handler: () => {} };
        server.route(fakeRoute);

        // exercise
        const response = await server.inject({
            method: fakeRoute.method,
            url: fakeRoute.path
        });

        // validate
        expect(response.statusCode).to.equals(403);
        expect(response.statusMessage).to.equals('Forbidden');
    });

    it('accepts post if crumb headers are valid', async () => {
        // setup
        const payload = 'payload';
        const fakeCrumb = 'crumb';
        const fakeRoute = { path: '/login', method: 'POST', handler: () => payload };
        server.route(fakeRoute);

        // exercise
        const response = await server.inject({
            method: fakeRoute.method,
            url: fakeRoute.path,
            headers: { cookie: 'crumb=' + fakeCrumb, 'x-csrf-token': fakeCrumb }
        });

        // validate
        expect(response.statusCode).to.equals(200);
        expect(response.result).to.equals(payload);
    });

    it('does not accept post if crumb headers are invalid', async () => {
        // setup
        const fakeRoute = { path: '/login', method: 'POST', handler: () => {} };
        server.route(fakeRoute);

        // exercise
        const response = await server.inject({
            method: fakeRoute.method,
            url: fakeRoute.path,
            headers: { cookie: 'crumb=valid', 'x-csrf-token': 'invalid' }
        });

        // validate
        expect(response.statusCode).to.equals(403);
        expect(response.statusMessage).to.equals('Forbidden');
    });
});
