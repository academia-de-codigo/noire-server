const Hoek = require('hoek');
const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const PermissionService = require('modules/authorization/services/permission');
const PermissionCtrl = require('modules/authorization/controllers/permission');
const Resources = require('enums/resources');
const NSError = require('errors/nserror');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('API Controller: permission', () => {
    const permissions = [
        {
            id: 0,
            action: 'read',
            description: 'read user',
            resourceId: 2
        },
        {
            id: 1,
            action: 'create',
            description: 'create user',
            resourceId: 4
        }
    ];

    let server;

    beforeEach(() => {
        server = Hapi.server({ debug: { log: false, request: false } });
    });

    it('lists available permissions', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const listStub = Sinon.stub(PermissionService, 'list');
        const countStub = Sinon.stub(PermissionService, 'count');
        const toolkitStub = Sinon.stub()
            .withArgs(permissions, permissions.length)
            .returns(permissions);

        listStub.resolves(permissions);
        countStub.resolves(permissions.length);

        server.route({ method: 'GET', path: '/permission', handler: PermissionCtrl.list });
        server.decorate('toolkit', 'paginate', toolkitStub);

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/permission'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(toolkitStub.calledOnce).to.be.true();

        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(permissions);
    });

    it('lists available permissions with criteria', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const fakeCriteria = { limit: '100' };
        const listStub = Sinon.stub(PermissionService, 'list');
        const countStub = Sinon.stub(PermissionService, 'count');
        const toolkitStub = Sinon.stub()
            .withArgs(permissions, permissions.length)
            .returns(permissions);

        listStub.withArgs(fakeCriteria).resolves(permissions);
        countStub.withArgs(fakeCriteria).resolves(permissions.length);

        server.route({ method: 'GET', path: '/permission', handler: PermissionCtrl.list });
        server.decorate('toolkit', 'paginate', toolkitStub);

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/permission?limit=100'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(toolkitStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(permissions);
    });

    it('handles server errors while listing permissions', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const listStub = Sinon.stub(PermissionService, 'list');
        const countStub = Sinon.stub(PermissionService, 'count');

        listStub.rejects(NSError.RESOURCE_FETCH());
        countStub.resolves();

        server.route({ method: 'GET', path: '/permission', handler: PermissionCtrl.list });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/permission'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();

        expect(response.statusCode).to.equals(500);
        expect(response.statusMessage).to.equals('Internal Server Error');
        expect(response.result.message).to.equals('An internal server error occurred');
    });

    it('gets a permission', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(PermissionService, 'findById');
        findByIdStub.withArgs(1).resolves(permissions[1]);

        server.route({ method: 'GET', path: '/permission/{id}', handler: PermissionCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/permission/1'
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();

        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(permissions[1]);
    });

    it('handles getting of a non existing permission', async flags => {
        // clean up
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(PermissionService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_NOT_FOUND());

        server.route({ method: 'GET', path: '/permission/{id}', handler: PermissionCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/permission/10'
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();

        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles server errors while getting a permission', async flags => {
        // clean up
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(PermissionService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_FETCH());

        server.route({ method: 'GET', path: '/permission/{id}', handler: PermissionCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/permission/1'
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();

        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('creates a new permission', async flags => {
        // clean up
        flags.onCleanup = function() {
            addStub.restore();
        };

        // setup
        const fakeId = 2;
        const entity = { action: 'delete', description: 'potato', resourceId: Resources.CONTACT };
        const addStub = Sinon.stub(PermissionService, 'add');
        addStub.withArgs(entity).resolves(Hoek.merge({ id: fakeId }, entity));

        server.route({ method: 'POST', path: '/permission', handler: PermissionCtrl.create });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/permission',
            payload: entity
        });

        // validate
        expect(addStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(201);
        expect(response.statusMessage).to.equal('Created');

        expect(response.result.id).to.equal(fakeId);
        expect(response.result.action).to.equal(entity.action);
        expect(response.result.description).to.equal(entity.description);
        expect(response.result.resourceId).to.equal(entity.resourceId);
        expect(response.headers.location).to.equal(`/permission/${fakeId}`);
    });

    it('does not create a permission that already exists', async flags => {
        // clean up
        flags.onCleanup = function() {
            addStub.restore();
        };

        // setup
        const addStub = Sinon.stub(PermissionService, 'add');
        addStub.rejects(NSError.RESOURCE_DUPLICATE());

        server.route({ method: 'POST', path: '/permission', handler: PermissionCtrl.create });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/permission'
        });

        // validate
        expect(addStub.calledOnce).to.be.true();

        expect(response.statusCode).to.equal(409);
        expect(response.statusMessage).to.equal('Conflict');
        expect(response.result.message).to.equal(NSError.RESOURCE_DUPLICATE().message);
    });

    it('handles servers error while creating a permission', async flags => {
        // clean up
        flags.onCleanup = function() {
            addStub.restore();
        };

        // setup
        const addStub = Sinon.stub(PermissionService, 'add');
        addStub.rejects(NSError.RESOURCE_INSERT());

        server.route({ method: 'POST', path: '/permission', handler: PermissionCtrl.create });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/permission'
        });

        // validate
        expect(addStub.calledOnce).to.be.true();

        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('deletes an existing permission', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(PermissionService, 'delete');
        deleteStub.withArgs(1).resolves();

        server.route({
            method: 'DELETE',
            path: '/permission/{id}',
            handler: PermissionCtrl.delete
        });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/permission/1'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(204);
        expect(response.statusMessage).to.equal('No Content');
    });

    it('handles deleting a permission that does not exist', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(PermissionService, 'delete');
        deleteStub.rejects(NSError.RESOURCE_NOT_FOUND());

        server.route({
            method: 'DELETE',
            path: '/permission/{id}',
            handler: PermissionCtrl.delete
        });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/permission/1'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles server errors while deleting a permission', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(PermissionService, 'delete');
        deleteStub.rejects(NSError.RESOURCE_DELETE());

        server.route({
            method: 'DELETE',
            path: '/permission/{id}',
            handler: PermissionCtrl.delete
        });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/permission/1'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('updates a permission', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // setup
        const fakePermission = { id: 1, action: 'create', resourceId: 10 };
        const entity = { description: 'potato' };
        const updateStub = Sinon.stub(PermissionService, 'update');
        updateStub.withArgs(fakePermission.id, entity).resolves(Hoek.merge(fakePermission, entity));

        server.route({
            method: 'PUT',
            path: '/permission/{id}',
            handler: PermissionCtrl.update
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: `/permission/${fakePermission.id}`,
            payload: entity
        });

        // validate
        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result.id).to.equal(fakePermission.id);
        expect(response.result.action).to.equal(fakePermission.action);
        expect(response.result.resourceId).to.equal(fakePermission.resourceId);
        expect(response.result.description).to.equal(entity.description);
    });

    it('handles server errors while updating a permission', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // setup
        const updateStub = Sinon.stub(PermissionService, 'update');
        updateStub.rejects(NSError.RESOURCE_UPDATE());

        server.route({
            method: 'PUT',
            path: '/permission/{id}',
            handler: PermissionCtrl.update
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/permission/1'
        });

        // validate
        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });
});
