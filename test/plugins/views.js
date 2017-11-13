const Lab = require('lab');
const Hapi = require('hapi');
const Vision = require('vision');
const Path = require('path');
const Package = require('../../package.json');
const Handlebars = require('handlebars');
const Views = require('../../lib/plugins/views');

const { afterEach, before, beforeEach, describe, expect, it } = exports.lab = Lab.script();

const internals = {};
internals.viewOptions = {
    engines: {
        hbs: Handlebars
    },
    layout: true,
    path: Path.join(__dirname, '/../fixtures'),
    isCached: false,
    context: {
        project: Package.name
    }
};

internals.viewFixture = 'page';
internals.fakeTemplate = 'pages/' + internals.viewFixture;

describe('Plugin: views', () => {

    let server;
    let visionRegister;

    before(() => {
        visionRegister = Vision.plugin.register;
    });

    beforeEach(async () => {

        server = Hapi.server();
        await server.register(Views);
    });

    afterEach(() => {
        // make sure monkey patch is removed
        Vision.plugin.register = visionRegister;
    });

    it('handles vision plugin registration failures', async () => {

        // setup
        const PLUGIN_ERROR = 'plugin error';
        Vision.plugin.register = async function() {
            throw new Error(PLUGIN_ERROR);
        };
        const server = Hapi.server();

        // exercise and validate
        await expect(server.register(Views)).to.reject(PLUGIN_ERROR);
    });

    it('ignores non view responses', async () => {

        // setup
        const fakeResult = 'ok';
        const fakeRoute = {
            method: 'GET',
            path: '/',
            handler: () => fakeResult
        };
        server.views(internals.viewOptions);
        server.route(fakeRoute);

        // exercise
        const response = await server.inject('/');

        // validate
        expect(response.result).to.equals(fakeResult);
    });

    it('adds global context property to the view context', async () => {

        // setup
        const fakeRoute = {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return h.view(internals.fakeTemplate);
            }
        };
        server.views(internals.viewOptions);
        server.route(fakeRoute);

        // exercise
        const response = await server.inject('/');

        // validate
        expect(response.result).to.be.a.string();
        expect(response.result).to.include(Package.name);
    });

    it('adds version number to a new local view context', async () => {

        // setup
        const fakeRoute = {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return h.view(internals.fakeTemplate);
            }
        };
        server.views(internals.viewOptions);
        server.route(fakeRoute);

        // exercise
        const response = await server.inject('/');

        // validate
        expect(response.result).to.be.a.string();
        expect(response.result).to.include(Package.version);
    });

    it('adds version number an existing local view context', async () => {

        // setup
        const fakeRoute = {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return h.view(internals.fakeTemplate);
            }
        };
        server.views(internals.viewOptions);
        server.route(fakeRoute);
        server.ext('onPostHandler', (request, h) => {
            request.response.source.context = {}; // create a new view context
            return h.continue;
        });

        // exercise
        const response = await server.inject('/');

        // validate
        expect(response.result).to.be.a.string();
        expect(response.result).to.include(Package.version);
    });

    it('adds logged in user to view context if authenticated', async () => {

        // setup
        const credentials = 'test';
        const fakeRoute = {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                request.auth.isAuthenticated = true;
                request.auth.credentials = credentials;
                return h.view(internals.fakeTemplate);
            }
        };
        server.views(internals.viewOptions);
        server.route(fakeRoute);

        // exercise
        const response = await server.inject('/');

        // validate
        expect(response.result).to.be.a.string();
        expect(response.result).to.include(credentials);
    });

    it('does not add logged in user to view context if not authenticated', async () => {

        // setup
        const credentials = 'test';
        const fakeRoute = {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                request.auth.credentials = credentials;
                return h.view(internals.fakeTemplate);
            }
        };
        server.views(internals.viewOptions);
        server.route(fakeRoute);

        // exercise
        const response = await server.inject('/');

        // validate
        expect(response.result).to.be.a.string();
        expect(response.result).to.not.include(credentials);
    });

    it('adds view name to view context', async () => {

        // setup
        const fakeRoute = {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return h.view(internals.fakeTemplate);
            }
        };
        server.views(internals.viewOptions);
        server.route(fakeRoute);

        // exercise
        const response = await server.inject('/');

        // validate
        expect(response.result).to.be.a.string();
        expect(response.result).to.include(internals.viewFixture);
    });
});
