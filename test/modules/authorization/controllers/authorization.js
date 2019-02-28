const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const AuthorizationController = require('modules/authorization/controllers/authorization');
const AuthorizationService = require('modules/authorization/services/authorization');
const Logger = require('test/fixtures/logger-plugin');

const { afterEach, beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Controller: Authorization', () => {
    const action = 'read';
    const resource = 'role';
    const username = 'username';
    const fakeResult = 'ok';
    const fakeRoute = { path: '/', method: 'GET', config: { handler: () => fakeResult } };

    let server;
    let authorizationStub;

    beforeEach(() => {
        authorizationStub = Sinon.stub(AuthorizationService, 'canUser');
        server = Hapi.server();
        server.register(Logger);
    });

    afterEach(() => {
        authorizationStub.restore();
    });

    it('authorizes user to access resource with explicit action', async () => {
        // setup
        authorizationStub.withArgs(username, action, resource).returns(Promise.resolve(true));

        // exercise
        fakeRoute.config.pre = [AuthorizationController.authorize(resource, action)];
        server.route(fakeRoute);
        const response = await server.inject({
            url: '/',
            auth: {
                credentials: { username },
                strategy: 'default'
            }
        });

        // validate
        expect(authorizationStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.equals(fakeResult);
    });

    it('authorizes user to access resource with implicit action', async () => {
        // setup
        authorizationStub.withArgs(username, action, resource).returns(Promise.resolve(true));

        // exercise
        fakeRoute.config.pre = [AuthorizationController.authorize(resource)];
        server.route(fakeRoute);
        const response = await server.inject({
            url: '/',
            auth: {
                credentials: { username },
                strategy: 'default'
            }
        });

        // validate
        expect(authorizationStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.equals(fakeResult);
    });

    it('does not authorize user to access resource', async () => {
        // setup
        authorizationStub.withArgs(username, action, resource).returns(Promise.resolve(false));

        // exercise
        fakeRoute.config.pre = [AuthorizationController.authorize(resource)];
        server.route(fakeRoute);
        const response = await server.inject({
            url: '/',
            auth: {
                credentials: { username },
                strategy: 'default'
            }
        });

        // validate
        expect(authorizationStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(403);
        expect(response.statusMessage).to.equals('Forbidden');
        expect(response.result.message).to.equals('insufficient privileges');
    });

    it('handles errors while authorizing', async () => {
        // setup
        authorizationStub.withArgs(username, action, resource).returns(Promise.reject(new Error()));

        // exercise
        fakeRoute.config.pre = [AuthorizationController.authorize(resource)];
        server.route(fakeRoute);
        const response = await server.inject({
            url: '/',
            auth: {
                credentials: { username },
                strategy: 'default'
            }
        });

        // validate
        expect(authorizationStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(500);
        expect(response.statusMessage).to.equals('Internal Server Error');
        expect(response.result.message).to.equals('An internal server error occurred');
    });
});
