const Hoek = require('hoek');
const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const UserService = require('modules/authorization/services/user');
const ProfileCtrl = require('modules/authorization/controllers/api/profile');
const NSError = require('errors/nserror');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('API Controller: Profile', () => {
    const user = {
        id: 1,
        username: 'test',
        email: 'test@gmail.com'
    };

    let server;

    beforeEach(() => {
        // make server quiet, 500s are rethrown and logged by default..
        server = Hapi.server({ debug: { log: false, request: false } });
    });

    it('gets the user profile', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.withArgs(user.id).resolves(user);
        server.route({ method: 'GET', path: '/profile', handler: ProfileCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/profile',
            auth: {
                credentials: user,
                strategy: 'default'
            }
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(user);
    });

    it('handles get of a non existing user profile', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'GET', path: '/profile', handler: ProfileCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/profile',
            auth: {
                credentials: { id: 900 },
                strategy: 'deafult'
            }
        });

        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(404);
        expect(response.statusMessage).to.equals('Not Found');
        expect(response.result.message).to.equals(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles server errors when getting the user profile', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_FETCH());
        server.route({ method: 'GET', path: '/profile', handler: ProfileCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/profile',
            auth: {
                credentials: user,
                strategy: 'default'
            }
        });

        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('updates the user profile', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // setup
        const entity = { username: 'test2', name: 'test2', password: 'test2' };
        const updateStub = Sinon.stub(UserService, 'update');
        updateStub.withArgs(user.id, entity).resolves(Hoek.merge({ id: user.id }, entity));
        server.route({ method: 'PUT', path: '/profile', handler: ProfileCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/profile',
            auth: {
                credentials: user,
                strategy: 'default'
            },
            payload: entity
        });

        // validate
        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result.password).to.not.exists();
        expect(response.result.id).to.equals(user.id);
        expect(response.result.username).to.equals(entity.username);
        expect(response.result.email).to.equals(entity.email);
        expect(response.result.name).to.equals(entity.name);
    });

    it('handles updating a user that does not exit', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // setup
        const updateStub = Sinon.stub(UserService, 'update');
        updateStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'PUT', path: '/profile', handler: ProfileCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/profile',
            auth: {
                credentials: { id: 900 },
                strategy: 'default'
            }
        });

        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('does not update a user if username or email is taken', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // setup
        const updateStub = Sinon.stub(UserService, 'update');
        updateStub.rejects(NSError.RESOURCE_DUPLICATE());
        server.route({ method: 'PUT', path: '/profile', handler: ProfileCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/profile',
            auth: {
                credentials: user,
                strategy: 'default'
            }
        });

        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(409);
        expect(response.statusMessage).to.equal('Conflict');
        expect(response.result.message).to.equal(NSError.RESOURCE_DUPLICATE().message);
    });

    it('handles server errors while updating a user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // setup
        const updateStub = Sinon.stub(UserService, 'update');
        updateStub.rejects(NSError.RESOURCE_UPDATE());
        server.route({ method: 'PUT', path: '/profile', handler: ProfileCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/profile',
            auth: {
                credentials: user,
                strategy: 'default'
            }
        });

        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });
});
