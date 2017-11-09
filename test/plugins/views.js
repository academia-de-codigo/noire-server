const Lab = require('lab');
const Hapi = require('hapi');
const Vision = require('vision');
const Path = require('path');
const Handlebars = require('handlebars');
const Views = require('../../lib/plugins/views');

const { beforeEach, describe, expect, it } = exports.lab = Lab.script();

const internals = {};
internals.viewOptions = {
    engines: {
        hbs: Handlebars
    },
    layout: true,
    path: Path.join(__dirname, '/../fixtures'),
    isCached: false,
};

internals.viewFixture = 'page';
internals.fakeTemplate = 'pages/'+ internals.viewFixture;

describe('Plugin: views', () => {

    let server;

    beforeEach(async () => {

        server = Hapi.server();
        await server.register(Views);
    });

    it('handles vision plugin registration failures', async () => {

        // setup
        const PLUGIN_ERROR = 'plugin error';
        let visionRegister = Vision.plugin.register;
        Vision.plugin.register = async function() {
            throw new Error(PLUGIN_ERROR);
        };
        const server = Hapi.server();

        // exercise and validate
        await expect(server.register(Views)).to.reject(PLUGIN_ERROR);

        // cleanup
        Vision.plugin.register = visionRegister;
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
