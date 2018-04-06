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
        // setup
        const findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.withArgs(user.id).resolves(user);
        server.route({ method: 'GET', path: '/profile', handler: ProfileCtrl.get });
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/profile',
            credentials: user
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(JSON.parse(response.payload)).to.equal(user);
    });

    it('handles get of a non existing user profile', async flags => {
        // setup
        const findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'GET', path: '/profile', handler: ProfileCtrl.get });
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/profile',
            credentials: {
                id: 900
            }
        });

        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(404);
        expect(response.statusMessage).to.equals('Not Found');
        expect(JSON.parse(response.payload).message).to.equals(
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('handles server errors when getting the user profile', async flags => {
        // setup
        const findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_FETCH());
        server.route({ method: 'GET', path: '/profile', handler: ProfileCtrl.get });
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/profile',
            credentials: user
        });

        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
    });

    it('updates the user profile', async flags => {
        // setup
        const entity = { username: 'test2', name: 'test2', password: 'test2' };
        const updateStub = Sinon.stub(UserService, 'update');
        updateStub.withArgs(user.id, entity).resolves(Hoek.merge({ id: user.id }, entity));
        server.route({ method: 'PUT', path: '/profile', handler: ProfileCtrl.update });
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/profile',
            credentials: user,
            payload: entity
        });

        // validate
        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(200);
        expect(response.statusMessage).to.equal('OK');
        expect(JSON.parse(response.payload).password).to.not.exists();
        expect(JSON.parse(response.payload).id).to.equals(user.id);
        expect(JSON.parse(response.payload).username).to.equals(entity.username);
        expect(JSON.parse(response.payload).email).to.equals(entity.email);
        expect(JSON.parse(response.payload).name).to.equals(entity.name);
    });

    it('handles updating a user that does not exit', async flags => {
        // setup
        const updateStub = Sinon.stub(UserService, 'update');
        updateStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'PUT', path: '/profile', handler: ProfileCtrl.update });
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/profile',
            credentials: {
                id: 900
            }
        });

        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('does not update a user if username or email is taken', async flags => {
        // setup
        const updateStub = Sinon.stub(UserService, 'update');
        updateStub.rejects(NSError.RESOURCE_DUPLICATE());
        server.route({ method: 'PUT', path: '/profile', handler: ProfileCtrl.update });
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/profile',
            credentials: user
        });

        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(409);
        expect(response.statusMessage).to.equal('Conflict');
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_DUPLICATE().message);
    });

    it('handles server errors while updating a user', async flags => {
        // setup
        const updateStub = Sinon.stub(UserService, 'update');
        updateStub.rejects(NSError.RESOURCE_UPDATE());
        server.route({ method: 'PUT', path: '/profile', handler: ProfileCtrl.update });
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/profile',
            credentials: user
        });

        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
    });
});
