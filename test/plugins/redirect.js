const Hapi = require('hapi');
const Lab = require('lab');
const Path = require('path');
const Url = require('url');
const Config = require('../../lib/config');
const Redirect = require('../../lib/plugins/redirect');

const { beforeEach, describe, expect, it } = exports.lab = Lab.script();

const internals = {};

internals.webUrl = {
    protocol: 'http',
    slashes: true,
    hostname: Config.connections.web.host,
    port: Config.connections.web.port,
};

internals.webTlsUrl = {
    protocol: 'https',
    slashes: true,
    hostname: Config.connections.webTls.host,
    port: Config.connections.webTls.port,
};

internals.apiUrl = {
    protocol: 'https',
    slashes: true,
    hostname: Config.connections.api.host,
    port: Config.connections.api.port,
};

describe('Plugin: redirect', () => {

    let web;
    let webTls;

    beforeEach(async () => {

        web = Hapi.server({ app: { name: 'web' } });
        webTls = Hapi.server({ app: { name: 'webTls' } });

        await web.register({ plugin: Redirect, options: { tlsRoutes: Config.redirect.tlsOnly } });
        await webTls.register({ plugin: Redirect, options: { tlsRoutes: Config.redirect.tlsOnly } });
    });

    it('redirects web api requests to api server', async () => {

        // setup
        const redirectUrl = Url.format(internals.apiUrl) + Path.resolve(Config.prefixes.api, 'version');

        // exercise
        const response = await web.inject(Path.resolve(Config.prefixes.api, 'version'));

        // validate
        expect(response.statusCode).to.equal(301);
        expect(response.statusMessage).to.equal('Moved Permanently');
        expect(response.headers.location).to.equal(redirectUrl);
    });

    it('redirects http admin requests to https', async () => {

        // setup
        const redirectUrl = Url.format(internals.webTlsUrl) + Config.prefixes.admin;

        // exercise
        const response = await web.inject(Config.prefixes.admin);

        // validate
        expect(response.statusCode).to.equal(301);
        expect(response.statusMessage).to.equal('Moved Permanently');
        expect(response.headers.location).to.equal(redirectUrl);
    });

    it('redirects http profile requests to https', async () => {

        // setup
        const redirectUrl = Url.format(internals.webTlsUrl) + Config.prefixes.profile;

        // exercise
        const response = await web.inject(Config.prefixes.profile);

        // validate
        expect(response.statusCode).to.equal(301);
        expect(response.statusMessage).to.equal('Moved Permanently');
        expect(response.headers.location).to.equal(redirectUrl);
    });

    it('redirects http login requests to https', async () => {

        // setup
        const redirectUrl = Url.format(internals.webTlsUrl) + Config.prefixes.login;

        // exercise
        const response = await web.inject(Config.prefixes.login);

        // validate
        expect(response.statusCode).to.equal(301);
        expect(response.statusMessage).to.equal('Moved Permanently');
        expect(response.headers.location).to.equal(redirectUrl);
    });

    it('redirects http root requests to home', async () => {

        // setup
        const redirectUrl = Url.format(internals.webUrl) + '/home';

        // exercise
        const response = await web.inject('/');

        // validation
        expect(response.statusCode).to.equal(301);
        expect(response.statusMessage).to.equal('Moved Permanently');
        expect(response.headers.location).to.equal(redirectUrl);
    });

    it('https root request redirected to home', async () => {

        // setup
        const redirectUrl = Url.format(internals.webTlsUrl) + Config.prefixes.home;

        // exercise
        const response = await webTls.inject('/');

        // validation
        expect(response.statusCode).to.equal(301);
        expect(response.statusMessage).to.equal('Moved Permanently');
        expect(response.headers.location).to.equal(redirectUrl);
    });

    it('does not redirect https valid route', async () => {

        // setup
        const fakeResult = 'ok';
        const fakeRoute = { path: Config.prefixes.home, method: 'GET', handler: () => fakeResult };
        webTls.route(fakeRoute);

        // exercise
        const response = await webTls.inject(Config.prefixes.home);

        // validate
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.equal(fakeResult);
    });

    it('does not redirect on request to unknown server', async () => {

        // setup
        const server = Hapi.server({ app: {} });
        await server.register({ plugin: Redirect, options: { tlsRoutes: Config.redirect.tlsOnly } });

        // exercise
        const response = await server.inject(Config.prefixes.admin);

        // validate
        expect(response.statusCode).to.equal(404);
    });

    it('does not redirect on request to api server', async () => {

        // setup
        const server = Hapi.server({ app: { name: 'api' } });
        await server.register({ plugin: Redirect, options: { tlsRoutes: Config.redirect.tlsOnly } });

        // exercise
        const response = await server.inject(Config.prefixes.admin);

        // validate
        expect(response.statusCode).to.equal(404);
    });
});
