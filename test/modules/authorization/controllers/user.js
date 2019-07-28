const Hoek = require('hoek');
const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const UserService = require('modules/authorization/services/user');
const UserCtrl = require('modules/authorization/controllers/user');
const NSError = require('errors/nserror');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('API Controller: user', () => {
    const users = [
        {
            id: 0,
            username: 'test',
            email: 'test@gmail.com'
        },
        {
            id: 1,
            username: 'admin',
            email: 'admin@gmail.com'
        }
    ];

    let server;

    beforeEach(() => {
        // make server quiet, 500s are rethrown and logged by default..
        server = Hapi.server({ debug: { log: false, request: false } });
    });

    it('lists available users', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const listStub = Sinon.stub(UserService, 'list');
        const countStub = Sinon.stub(UserService, 'count');
        const toolkitStub = Sinon.stub()
            .withArgs(users, users.length)
            .returns(users);
        listStub.resolves(users);
        countStub.resolves(users.length);
        server.route({ method: 'GET', path: '/user', handler: UserCtrl.list });
        server.decorate('toolkit', 'paginate', toolkitStub);

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/user'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(toolkitStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(users);
    });

    it('lists available users with criteria', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const fakeCriteria = { limit: '100' };
        const listStub = Sinon.stub(UserService, 'list');
        const countStub = Sinon.stub(UserService, 'count');
        const toolkitStub = Sinon.stub()
            .withArgs(users, users.length)
            .returns(users);
        listStub.withArgs(fakeCriteria).resolves(users);
        countStub.withArgs(fakeCriteria).resolves(users.length);
        server.route({ method: 'GET', path: '/user', handler: UserCtrl.list });
        server.decorate('toolkit', 'paginate', toolkitStub);

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/user?limit=100'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(toolkitStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(users);
    });

    it('handles server errors while listing users', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const listStub = Sinon.stub(UserService, 'list');
        const countStub = Sinon.stub(UserService, 'count');
        listStub.rejects(NSError.RESOURCE_FETCH());
        countStub.resolves();
        server.route({ method: 'GET', path: '/user', handler: UserCtrl.list });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/user'
        });

        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('gets a user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.withArgs(1).resolves(users[1]);
        server.route({ method: 'GET', path: '/user/{id}', handler: UserCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/user/1'
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(users[1]);
    });

    it('handles get of a non existing user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'GET', path: '/user/{id}', handler: UserCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/user/2'
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(404);
        expect(response.statusMessage).to.equals('Not Found');
        expect(response.result.message).to.equals(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles server errors when getting a user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_FETCH());
        server.route({ method: 'GET', path: '/user/{id}', handler: UserCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/user/1'
        });

        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('creates a new user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addStub.restore();
        };

        // setup
        const fakeId = 1;
        const entity = {
            username: 'test2',
            email: 'test2@gmail.com',
            name: 'test2',
            password: 'test2'
        };
        const addStub = Sinon.stub(UserService, 'add');
        addStub.withArgs(entity).resolves(Hoek.merge({ id: fakeId }, entity));
        server.route({ method: 'POST', path: '/user', handler: UserCtrl.create });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/user',
            payload: entity
        });

        // validate
        expect(addStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(201);
        expect(response.statusMessage).to.equal('Created');
        expect(response.result.password).to.not.exists();
        expect(response.result.id).to.equals(fakeId);
        expect(response.result.username).to.equals(entity.username);
        expect(response.result.email).to.equals(entity.email);
        expect(response.result.name).to.equals(entity.name);
        expect(response.headers.location).to.equals('/user/' + fakeId);
    });

    it('does not create a user that already exists', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addStub.restore();
        };

        // setup
        const addStub = Sinon.stub(UserService, 'add');
        addStub.rejects(NSError.RESOURCE_DUPLICATE());
        server.route({ method: 'POST', path: '/user', handler: UserCtrl.create });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/user'
        });

        // validate
        expect(addStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(409);
        expect(response.statusMessage).to.equal('Conflict');
        expect(response.result.message).to.equal(NSError.RESOURCE_DUPLICATE().message);
    });

    it('handles server errors while creating a user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addStub.restore();
        };

        // setup
        const addStub = Sinon.stub(UserService, 'add');
        addStub.rejects(NSError.RESOURCE_INSERT());
        server.route({ method: 'POST', path: '/user', handler: UserCtrl.create });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/user'
        });

        // validate
        expect(addStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('deletes an existing user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(UserService, 'delete');
        deleteStub.withArgs(1).resolves();
        server.route({ method: 'DELETE', path: '/user/{id}', handler: UserCtrl.delete });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/user/1'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(204);
        expect(response.statusMessage).to.equal('No Content');
    });

    it('handles deleting a user that does not exist', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(UserService, 'delete');
        deleteStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'DELETE', path: '/user/{id}', handler: UserCtrl.delete });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/user/1'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('does not delete a user that is active', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(UserService, 'delete');
        deleteStub.rejects(NSError.RESOURCE_STATE());
        server.route({ method: 'DELETE', path: '/user/{id}', handler: UserCtrl.delete });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/user/1'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(409);
        expect(response.statusMessage).to.equal('Conflict');
        expect(response.result.message).to.equal(NSError.RESOURCE_STATE().message);
    });

    it('handles server errors while deleting a user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(UserService, 'delete');
        deleteStub.rejects(NSError.RESOURCE_DELETE());
        server.route({ method: 'DELETE', path: '/user/{id}', handler: UserCtrl.delete });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/user/1'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('updates a user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // setup
        const fakeId = 1;
        const entity = { username: 'test2', name: 'test2', password: 'test2' };
        const updateStub = Sinon.stub(UserService, 'update');
        updateStub.withArgs(fakeId, entity).resolves(Hoek.merge({ id: fakeId }, entity));
        server.route({ method: 'PUT', path: '/user/{id}', handler: UserCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/user/' + fakeId,
            payload: entity
        });

        // validate
        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result.password).to.not.exists();
        expect(response.result.id).to.equals(fakeId);
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
        server.route({ method: 'PUT', path: '/user/{id}', handler: UserCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/user/2'
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
        server.route({ method: 'PUT', path: '/user/{id}', handler: UserCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/user/1'
        });

        // validate
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
        server.route({ method: 'PUT', path: '/user/{id}', handler: UserCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/user/1'
        });

        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });
});
