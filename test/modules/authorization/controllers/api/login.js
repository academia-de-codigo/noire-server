const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const JWT = require('jsonwebtoken');
const UserService = require('modules/authorization/services/user');
const LoginCtrl = require('modules/authorization/controllers/api/login');
const Auth = require('plugins/auth');
const NSError = require('errors/nserror');
const Logger = require('test/fixtures/logger-plugin');
const Config = require('config');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('API Controller: login', () => {
    // created using npm run token
    const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwidmVyc2lvbiI6MSwiaWF0IjoxNTI5OTQ4MjgyLCJleHAiOjE1Mjk5NTE4ODIsImF1ZCI6WyJub2lyZTphdXRoIl19.9QZNHh9rn0KFMxmxu8g-3sC4_G0Ompgy28c_DgicljQ';
    let server;

    beforeEach(async () => {
        // make server quiet, 500s are rethrown and logged by default..
        server = Hapi.server({ debug: { log: false, request: false } });
        await server.register(Logger);
        server.route({
            method: 'POST',
            path: '/login',
            config: { handler: LoginCtrl.login, plugins: { stateless: true } }
        });
        server.route({
            method: 'GET',
            path: '/logout',
            config: { handler: LoginCtrl.logout, plugins: { stateless: true } }
        });

        server.route({
            method: 'GET',
            path: '/renew',
            config: { handler: LoginCtrl.renew, plugins: { stateless: true } }
        });

        server.route({
            method: 'POST',
            path: '/password-reset',
            config: { handler: LoginCtrl.passwordReset, plugins: { stateless: true } }
        });

        server.route({
            method: 'POST',
            path: '/password-update',
            config: { handler: LoginCtrl.passwordUpdate, plugins: { stateless: true } }
        });
    });

    it('rejects login with invalid username', async flags => {
        // cleanup
        flags.onCleanup = function() {
            authenticateStub.restore();
        };

        // setup
        const credentials = { username: 'invalid', password: 'secret' };
        const authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub
            .withArgs(credentials.username, credentials.password)
            .rejects(NSError.AUTH_INVALID_CREDENTIALS());

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
        expect(response.result.message).to.equal(NSError.AUTH_INVALID_CREDENTIALS().message);
    });

    it('rejects login with invalid password', async flags => {
        // cleanup
        flags.onCleanup = function() {
            authenticateStub.restore();
        };

        // setup
        const credentials = { username: 'test', password: '' };
        const authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub
            .withArgs(credentials.username, credentials.password)
            .rejects(NSError.AUTH_INVALID_CREDENTIALS());

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
        expect(response.result.message).to.equal(NSError.AUTH_INVALID_CREDENTIALS().message);
    });

    it('handles internal server errors', async flags => {
        // cleanup
        flags.onCleanup = function() {
            authenticateStub.restore();
        };

        // setup
        const credentials = { username: 'test', password: 'test' };
        const authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub
            .withArgs(credentials.username, credentials.password)
            .rejects(NSError.AUTH_ERROR());

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/login',
            payload: credentials
        });

        expect(authenticateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('login user with valid credentials', async flags => {
        // cleanup
        flags.onCleanup = function() {
            authenticateStub.restore();
        };

        // setup
        const credentials = { username: 'test', password: 'secret' };
        const authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(credentials.username, credentials.password).resolves(token);

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/login',
            payload: credentials
        });

        expect(authenticateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.headers['server-authorization']).to.exist();
        expect(response.headers['server-authorization']).to.equals(token);
    });

    it('stores token in cookie if statefull login', async flags => {
        // cleanup
        flags.onCleanup = function() {
            authenticateStub.restore();
        };

        // setup
        server = Hapi.server();
        server.route({
            method: 'POST',
            path: '/login',
            config: { handler: LoginCtrl.login, plugins: { stateless: false } }
        });
        const credentials = { username: 'invalid', password: 'secret' };
        const authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(credentials.username, credentials.password).resolves(token);

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
        expect(response.result.success).to.be.true();
        expect(response.result.message).to.equals('logged out');
    });

    it('removes token from cookie if statefull logout', async () => {
        // setup
        server = Hapi.server();
        server.route({
            method: 'GET',
            path: '/logout',
            config: { handler: LoginCtrl.logout, plugins: { stateless: false } }
        });

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

    it('renews authentication token', async () => {
        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/renew',
            headers: {
                authorization: `${token}`
            }
        });

        // validate
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.headers['server-authorization']).to.exist();
        expect(response.headers['server-authorization']).not.to.equals(token);
        expect(JWT.decode(response.headers['server-authorization']).id).to.equals(
            JWT.decode(token).id
        );
        expect(JWT.decode(response.headers['server-authorization']).version).to.equal(
            Config.auth.version
        );
        expect(JWT.decode(response.headers['server-authorization']).exp).to.be.a.number();
    });

    it('sends password reset email', async flags => {
        // cleanup
        flags.onCleanup = function() {
            UserService.sendPasswordResetEmail.restore();
        };

        // setup
        Sinon.stub(UserService, 'sendPasswordResetEmail').resolves();

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/password-reset',
            payload: { email: '' }
        });

        // validate
        expect(UserService.sendPasswordResetEmail.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result.success).to.be.true();
        expect(response.result.message).to.equals('password reset');
    });

    it('handles sending password reset email errors', async flags => {
        // cleanup
        flags.onCleanup = function() {
            UserService.sendPasswordResetEmail.restore();
        };

        // setup
        Sinon.stub(UserService, 'sendPasswordResetEmail').rejects();

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/password-reset',
            payload: { email: '' }
        });

        // validate
        expect(UserService.sendPasswordResetEmail.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('updates the user password', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.decodeToken.restore();
            UserService.findById.restore();
            UserService.update.restore();
        };

        // setup
        const fakePass = 'new-password';
        const user = { id: 1, username: 'admin', email: 'admin@gmail.com', active: true };
        Sinon.stub(Auth, 'decodeToken')
            .withArgs(token, Auth.token.PASSWORD_RESET)
            .resolves({ id: user.id });
        Sinon.stub(UserService, 'findById')
            .withArgs(user.id)
            .resolves(user);
        Sinon.stub(UserService, 'update')
            .withArgs(user.id, { email: user.email, password: fakePass })
            .resolves();

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: `/password-update?token=${token}`,
            payload: {
                password: fakePass,
                email: user.email
            }
        });

        // validate
        expect(Auth.decodeToken.calledOnce).to.be.true();
        expect(UserService.findById.calledOnce).to.be.true();
        expect(UserService.update.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result.success).to.be.true();
        expect(response.result.message).to.equals('password update');
    });

    it('does not update the user password when token verification fails', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.decodeToken.restore();
        };

        // setup
        Sinon.stub(Auth, 'decodeToken').rejects();

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: `/password-update?token=${token}`
        });

        // validate
        expect(Auth.decodeToken.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(403);
        expect(response.statusMessage).to.equal('Forbidden');
        expect(response.result.message).to.equal('Authentication Failure');
    });

    it('does not update the user password when user is not found', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.decodeToken.restore();
            UserService.findById.restore();
        };

        // setup
        Sinon.stub(Auth, 'decodeToken').resolves({ id: 1 });
        Sinon.stub(UserService, 'findById').rejects();

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: `/password-update?token=${token}`
        });

        // validate
        expect(Auth.decodeToken.calledOnce).to.be.true();
        expect(UserService.findById.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(403);
        expect(response.statusMessage).to.equal('Forbidden');
        expect(response.result.message).to.equal('Authentication Failure');
    });

    it('does not update the user password when user is not active', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.decodeToken.restore();
            UserService.findById.restore();
        };

        // setup
        const user = { id: 1, username: 'admin', email: 'admin@gmail.com', active: false };
        Sinon.stub(Auth, 'decodeToken').resolves({ id: user.id });
        Sinon.stub(UserService, 'findById').resolves(user);

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: `/password-update?token=${token}`
        });

        // validate
        expect(Auth.decodeToken.calledOnce).to.be.true();
        expect(UserService.findById.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(403);
        expect(response.statusMessage).to.equal('Forbidden');
        expect(response.result.message).to.equal(NSError.AUTH_UNAUTHORIZED().message);
    });

    it('does not update the user password if email is incorrect', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.decodeToken.restore();
            UserService.findById.restore();
        };

        // setup
        const user = { id: 1, username: 'admin', email: 'admin@gmail.com', active: true };
        Sinon.stub(Auth, 'decodeToken').resolves({ id: user.id });
        Sinon.stub(UserService, 'findById').resolves(user);

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: `/password-update?token=${token}`,
            payload: {
                password: 'password',
                email: 'invalid'
            }
        });

        // validate
        expect(Auth.decodeToken.calledOnce).to.be.true();
        expect(UserService.findById.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(403);
        expect(response.statusMessage).to.equal('Forbidden');
        expect(response.result.message).to.equal(NSError.AUTH_UNAUTHORIZED().message);
    });

    it('handles update password errors', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.decodeToken.restore();
            UserService.findById.restore();
            UserService.update.restore();
        };

        // setup
        const user = { id: 1, username: 'admin', email: 'admin@gmail.com', active: true };
        Sinon.stub(Auth, 'decodeToken').resolves({ id: user.id });
        Sinon.stub(UserService, 'findById').resolves(user);
        Sinon.stub(UserService, 'update').rejects();

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: `/password-update?token=${token}`,
            payload: {
                password: 'password',
                email: user.email
            }
        });

        // validate
        expect(Auth.decodeToken.calledOnce).to.be.true();
        expect(UserService.findById.calledOnce).to.be.true();
        expect(UserService.update.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });
});
