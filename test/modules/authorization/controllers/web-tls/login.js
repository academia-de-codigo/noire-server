const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const Auth = require('plugins/auth');
const Logger = require('test/fixtures/logger-plugin');
const LoginCtrl = require('modules/authorization/controllers/web-tls/login');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Web TLS Controller: login', () => {
    // created using npm run token
    const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNDc5MDQzNjE2fQ.IUXsKd8zaA1Npsh3P-WST5IGa-w0TsVMKh28ONkWqr8';

    let server;
    beforeEach(async () => {
        // make server quiet, 500s are rethrown and logged by default..
        server = Hapi.server({ debug: { log: false, request: false } });
        await server.register(Logger);

        server.route({
            method: 'GET',
            path: '/password-update',
            config: { handler: LoginCtrl.showPasswordUpdate }
        });
    });

    it('validates token when show password update view is requested', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.decodeToken.restore();
        };

        // setup
        const fakeView = 'a view';
        Sinon.stub(Auth, 'decodeToken')
            .withArgs(token, Auth.token.PASSWORD_RESET)
            .resolves();
        const viewStub = Sinon.stub().returns(fakeView);
        server.decorate('toolkit', 'view', viewStub);

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: `/password-update?token=${token}`
        });

        // validate
        expect(Auth.decodeToken.calledOnce).to.be.true();
        expect(viewStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.payload).to.equal(fakeView);
    });

    it('handles token validation errors when rendering show password update view', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.decodeToken.restore();
        };

        // setup
        Sinon.stub(Auth, 'decodeToken').rejects();

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: `/password-update?token=${token}`
        });

        // validate
        expect(Auth.decodeToken.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(403);
        expect(response.statusMessage).to.equal('Forbidden');
    });
});
