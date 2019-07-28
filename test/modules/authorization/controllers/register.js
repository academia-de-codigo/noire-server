const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const Auth = require('plugins/auth');
const NSError = require('errors/nserror');
const RegisterCtrl = require('modules/authorization/controllers/register');
const ContactService = require('modules/authorization/services/contacts');
const Logger = require('test/fixtures/logger-plugin');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('API Controller: register', () => {
    let server;

    beforeEach(async () => {
        // make server quiet, 500s are rethrown and logged by default..
        server = Hapi.server({ debug: { log: false, request: false } });
        await server.register(Logger);
    });

    it('returns the correct view when the token is valid', async flags => {
        // cleanup
        flags.onCleanup = function() {
            decodeTokenStub.restore();
        };

        // setup
        const decodeTokenStub = Sinon.stub(Auth, 'decodeToken');
        decodeTokenStub.resolves();
        const toolkitStub = Sinon.stub()
            .withArgs('pages/register')
            .returns({});
        server.route({ method: 'GET', path: '/register', handler: RegisterCtrl.showRegister });
        server.decorate('toolkit', 'view', toolkitStub);

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/register'
        });

        // validate
        expect(decodeTokenStub.calledOnce).to.be.true();
        expect(toolkitStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
    });

    it('handles errors when the token is invalid', async flags => {
        // cleanup
        flags.onCleanup = function() {
            decodeTokenStub.restore();
        };

        // setup
        const decodeTokenStub = Sinon.stub(Auth, 'decodeToken');
        decodeTokenStub.throws(Error('Fake Error'));
        server.route({ method: 'GET', path: '/register', handler: RegisterCtrl.showRegister });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/register'
        });

        // validate
        expect(decodeTokenStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(403);
        expect(response.statusMessage).to.equal('Forbidden');
        expect(response.result.message).to.equal('Authentication failure');
    });

    it('registers user when provided with a valid token', async flags => {
        // cleanup
        flags.onCleanup = function() {
            decodeTokenStub.restore();
            registerStub.restore();
        };

        // setup
        const fakeToken = 'fakeToken';
        const fakePayload = {};
        const fakeRegisterResponsePayload = {
            id: 3,
            success: true,
            message: 'registered'
        };

        const decodeTokenStub = Sinon.stub(Auth, 'decodeToken');
        decodeTokenStub.withArgs(fakeToken, Auth.token.SIGNUP).resolves({ id: 3 });

        const registerStub = Sinon.stub(ContactService, 'register');
        registerStub.withArgs(3, fakePayload).resolves({ id: 3 });
        server.route({ method: 'POST', path: '/register', handler: RegisterCtrl.register });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/register?token=' + fakeToken,
            payload: fakePayload
        });

        // validate
        expect(decodeTokenStub.calledOnce).to.be.true();
        expect(registerStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(fakeRegisterResponsePayload);
    });

    it('handles trying to register a user with an invalid token', async flags => {
        // cleanup
        flags.onCleanup = function() {
            decodeTokenStub.restore();
            registerStub.restore();
        };

        // setup
        const invalidToken = 'fakeToken';
        const fakePayload = {};
        const errorMessage = 'Authentication Failure';

        const decodeTokenStub = Sinon.stub(Auth, 'decodeToken');
        decodeTokenStub.throws(NSError.AUTH_UNAUTHORIZED(errorMessage));
        const registerStub = Sinon.stub(ContactService, 'register');

        server.route({ method: 'POST', path: '/register', handler: RegisterCtrl.register });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/register?token=' + invalidToken,
            payload: fakePayload
        });

        // validate
        expect(decodeTokenStub.calledOnce).to.be.true();
        expect(registerStub.callCount).to.equal(0);
        expect(response.statusCode).to.equal(403);
        expect(response.statusMessage).to.equal('Forbidden');
        expect(response.result.message).to.equal(errorMessage);
    });
});
