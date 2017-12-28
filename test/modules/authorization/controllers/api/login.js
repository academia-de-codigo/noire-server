const Path = require('path');
const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const UserService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/user'));
const LoginCtrl = require(Path.join(process.cwd(), 'lib/modules/authorization/controllers/api/login'));
const NSError = require(Path.join(process.cwd(), 'lib/errors/nserror'));

const { beforeEach, describe, expect, it } = exports.lab = Lab.script();

describe('API Controller: login', () => {

    // created using npm run token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNDc5MDQzNjE2fQ.IUXsKd8zaA1Npsh3P-WST5IGa-w0TsVMKh28ONkWqr8';

    let server;

    beforeEach(() => {
        server = Hapi.server();
        server.route({ method: 'POST', path: '/login', config: { handler: LoginCtrl.login, plugins: { stateless: true } } });
        server.route({ method: 'GET', path: '/logout', config: { handler: LoginCtrl.logout, plugins: { stateless: true } } });
    });

    it('rejects login with invalid username', async (flags) => {

        // setup
        const credentials = { username: 'invalid', password: 'secret' };
        const authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(credentials.username, credentials.password).rejects(NSError.AUTH_INVALID_USERNAME());
        flags.onCleanup = function() {
            authenticateStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/login',
            payload: credentials
        });

        // validate
        expect(authenticateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(401);
        expect(response.statusMessage).to.equal('Unauthorized');
        expect(JSON.parse(response.payload).message).to.equal(NSError.AUTH_INVALID_USERNAME().message);
    });

    it('rejects login with invalid password', async (flags) => {

        // setup
        const credentials = { username: 'test', password: '' };
        const authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(credentials.username, credentials.password).rejects(NSError.AUTH_INVALID_PASSWORD());
        flags.onCleanup = function() {
            authenticateStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/login',
            payload: credentials
        });

        // validate
        expect(authenticateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(401);
        expect(response.statusMessage).to.equal('Unauthorized');
        expect(JSON.parse(response.payload).message).to.equal(NSError.AUTH_INVALID_PASSWORD().message);
    });

    it('handles internal server errors', async (flags) => {

        // setup
        server = Hapi.server({ debug: { log: false, request: false } }); // make server quiet, 500s are rethrown and logged by default..
        server.route({ method: 'POST', path: '/login', config: { handler: LoginCtrl.login, plugins: { stateless: true } } });
        const credentials = { username: 'test', password: 'test' };
        const authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(credentials.username, credentials.password).rejects(NSError.AUTH_ERROR());
        flags.onCleanup = function() {
            authenticateStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/login',
            payload: credentials
        });

        expect(authenticateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
    });

    it('login user with valid credentials', async (flags) => {

        // setup
        const credentials = { username: 'test', password: 'secret' };
        const authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(credentials.username, credentials.password).resolves(token);
        flags.onCleanup = function() {
            authenticateStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/login',
            payload: credentials
        });

        expect(authenticateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.headers.authorization).to.exist();
        expect(response.headers.authorization).to.equals(token);
    });

    it('stores token in cookie if statefull login', async (flags) => {

        // setup
        server = Hapi.server();
        server.route({ method: 'POST', path: '/login', config: { handler: LoginCtrl.login, plugins: { stateless: false } } });
        const credentials = { username: 'invalid', password: 'secret' };
        const authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(credentials.username, credentials.password).resolves(token);
        flags.onCleanup = function() {
            authenticateStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/login',
            payload: credentials
        });

        expect(authenticateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.headers['set-cookie']).to.be.an.array();
        expect(response.headers['set-cookie'][0]).to.be.a.string();
        expect(response.headers['set-cookie'][0].startsWith('token=')).to.be.true();
        expect(response.headers['set-cookie'][0].indexOf(token)).to.equals('token='.length);
    });

    it('logout user', async () => {

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/logout'
        });

        // validate
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(JSON.parse(response.payload).success).to.be.true();
        expect(JSON.parse(response.payload).message).to.equals('logged out');
    });

    it('removes token from cookie if statefull logout', async () => {

        // setup
        server = Hapi.server();
        server.route({ method: 'GET', path: '/logout', config: { handler: LoginCtrl.logout, plugins: { stateless: false } } });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/logout'
        });

        // validate
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.headers['set-cookie']).to.be.an.array();
        expect(response.headers['set-cookie'][0]).to.be.a.string();
        expect(response.headers['set-cookie'][0].startsWith('token=;')).to.be.true();
    });
});
