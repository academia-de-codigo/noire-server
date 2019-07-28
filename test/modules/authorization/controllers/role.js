const Hoek = require('hoek');
const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const RoleService = require('modules/authorization/services/role');
const RoleCtrl = require('modules/authorization/controllers/role');
const NSError = require('errors/nserror');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('API Controller: role', () => {
    const roles = [
        {
            id: 0,
            name: 'admin',
            description: 'admin'
        },
        {
            id: 1,
            name: 'user',
            description: 'user',
            users: [
                {
                    id: 1
                }
            ]
        }
    ];

    let server;

    beforeEach(() => {
        // make server quiet, 500s are rethrown and logged by default..
        server = Hapi.server({ debug: { log: false, request: false } });
    });

    it('lists available roles', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const listStub = Sinon.stub(RoleService, 'list');
        const countStub = Sinon.stub(RoleService, 'count');
        const toolkitStub = Sinon.stub()
            .withArgs(roles, roles.length)
            .returns(roles);
        listStub.resolves(roles);
        countStub.resolves(roles.length);
        server.route({ method: 'GET', path: '/role', handler: RoleCtrl.list });
        server.decorate('toolkit', 'paginate', toolkitStub);

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/role'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(toolkitStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(roles);
    });

    it('lists available roles with criteria', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const fakeCriteria = { limit: '100' };
        const listStub = Sinon.stub(RoleService, 'list');
        const countStub = Sinon.stub(RoleService, 'count');
        const toolkitStub = Sinon.stub()
            .withArgs(roles, roles.length)
            .returns(roles);
        listStub.withArgs(fakeCriteria).resolves(roles);
        countStub.withArgs(fakeCriteria).resolves(roles.length);
        server.route({ method: 'GET', path: '/role', handler: RoleCtrl.list });
        server.decorate('toolkit', 'paginate', toolkitStub);

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/role?limit=100'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(toolkitStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(roles);
    });

    it('handles server errors while listing roles', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const listStub = Sinon.stub(RoleService, 'list');
        const countStub = Sinon.stub(RoleService, 'count');
        listStub.rejects(NSError.RESOURCE_FETCH());
        countStub.resolves();
        server.route({ method: 'GET', path: '/role', handler: RoleCtrl.list });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/role'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(500);
        expect(response.statusMessage).to.equals('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('gets a role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(RoleService, 'findById');
        findByIdStub.withArgs(1).resolves(roles[1]);
        server.route({ method: 'GET', path: '/role/{id}', handler: RoleCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/role/1'
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(roles[1]);
    });

    it('handles get of a non existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(RoleService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'GET', path: '/role/{id}', handler: RoleCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/role/2'
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(404);
        expect(response.statusMessage).to.equals('Not Found');
        expect(response.result.message).to.equals(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles server errors while getting a role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(RoleService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_FETCH());
        server.route({ method: 'GET', path: '/role/{id}', handler: RoleCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/role/1'
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('creates a new role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addStub.restore();
        };

        // setup
        const fakeId = 1;
        const entity = { name: 'newrole', description: 'newrole' };
        const addStub = Sinon.stub(RoleService, 'add');
        addStub.withArgs(entity).resolves(Hoek.merge({ id: fakeId }, entity));
        server.route({ method: 'POST', path: '/role', handler: RoleCtrl.create });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/role',
            payload: entity
        });

        // validate
        expect(addStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(201);
        expect(response.statusMessage).to.equal('Created');
        expect(response.result.id).to.equals(fakeId);
        expect(response.result.name).to.equals(entity.name);
        expect(response.result.description).to.equals(entity.description);
        expect(response.headers.location).to.equals('/role/' + fakeId);
    });

    it('does not create a role that already exists', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addStub.restore();
        };

        // setup
        const addStub = Sinon.stub(RoleService, 'add');
        addStub.rejects(NSError.RESOURCE_DUPLICATE());
        server.route({ method: 'POST', path: '/role', handler: RoleCtrl.create });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/role'
        });

        // validate
        expect(addStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(409);
        expect(response.statusMessage).to.equal('Conflict');
        expect(response.result.message).to.equal(NSError.RESOURCE_DUPLICATE().message);
    });

    it('handles server errors while creating a role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addStub.restore();
        };

        // setup
        const addStub = Sinon.stub(RoleService, 'add');
        addStub.rejects(NSError.RESOURCE_INSERT());
        server.route({ method: 'POST', path: '/role', handler: RoleCtrl.create });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/role'
        });

        // validate
        expect(addStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('deletes an existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(RoleService, 'delete');
        deleteStub.withArgs(1).resolves();
        server.route({ method: 'DELETE', path: '/role/{id}', handler: RoleCtrl.delete });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/role/1'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(204);
        expect(response.statusMessage).to.equal('No Content');
    });

    it('handles deleting a role that does not exist', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(RoleService, 'delete');
        deleteStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'DELETE', path: '/role/{id}', handler: RoleCtrl.delete });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/role/1'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles deleting a role that has associated users', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(RoleService, 'delete');
        deleteStub.rejects(NSError.RESOURCE_RELATION());
        server.route({ method: 'DELETE', path: '/role/{id}', handler: RoleCtrl.delete });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/role/1'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(409);
        expect(response.statusMessage).to.equal('Conflict');
        expect(response.result.message).to.equal(NSError.RESOURCE_RELATION().message);
    });

    it('handles server errors while deleting a role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(RoleService, 'delete');
        deleteStub.rejects(NSError.RESOURCE_DELETE());
        server.route({ method: 'DELETE', path: '/role/{id}', handler: RoleCtrl.delete });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/role/1'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('updates a role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // setup
        const fakeId = 1;
        const entity = { name: 'user2', description: 'user2' };
        const updateStub = Sinon.stub(RoleService, 'update');
        updateStub.withArgs(fakeId, entity).resolves(Hoek.merge({ id: fakeId }, entity));
        server.route({ method: 'PUT', path: '/role/{id}', handler: RoleCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/' + fakeId,
            payload: entity
        });

        // validate
        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result.password).to.not.exists();
        expect(response.result.id).to.equals(fakeId);
        expect(response.result.name).to.equals(entity.name);
        expect(response.result.description).to.equals(entity.description);
    });

    it('handles updating a role that does not exit', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // setup
        const updateStub = Sinon.stub(RoleService, 'update');
        updateStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'PUT', path: '/role/{id}', handler: RoleCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/2'
        });

        // validate
        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('does not update a role if name is taken', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // setup
        const updateStub = Sinon.stub(RoleService, 'update');
        updateStub.rejects(NSError.RESOURCE_DUPLICATE());
        server.route({ method: 'PUT', path: '/role/{id}', handler: RoleCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/1'
        });

        // validate
        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(409);
        expect(response.statusMessage).to.equal('Conflict');
        expect(response.result.message).to.equal(NSError.RESOURCE_DUPLICATE().message);
    });

    it('handles server errors while updating a role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updateStub.restore();
        };

        // setup
        const updateStub = Sinon.stub(RoleService, 'update');
        updateStub.rejects(NSError.RESOURCE_UPDATE());
        server.route({ method: 'PUT', path: '/role/{id}', handler: RoleCtrl.update });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/1'
        });

        // validate
        expect(updateStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('adds user to an existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addUsersStub.restore();
        };

        // setup
        const fakeMappings = { roleId: 0, userId: 1 };
        const addUsersStub = Sinon.stub(RoleService, 'addUsers');
        addUsersStub.withArgs(0, 1).resolves(fakeMappings);
        server.route({ method: 'PUT', path: '/role/{id}/users', handler: RoleCtrl.addUsers });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/0/users',
            payload: { id: 1 }
        });

        // validate
        expect(addUsersStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equals(fakeMappings);
    });

    it('handles adding a user that does not exists or to a non existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addUsersStub.restore();
        };

        // setup
        const addUsersStub = Sinon.stub(RoleService, 'addUsers');
        addUsersStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'PUT', path: '/role/{id}/users', handler: RoleCtrl.addUsers });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/0/users',
            payload: { id: 1 }
        });

        // validate
        expect(addUsersStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles adding a user to a role that already contains it', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addUsersStub.restore();
        };

        // setup
        const addUsersStub = Sinon.stub(RoleService, 'addUsers');
        addUsersStub.rejects(NSError.RESOURCE_DUPLICATE());
        server.route({ method: 'PUT', path: '/role/{id}/users', handler: RoleCtrl.addUsers });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/0/users',
            payload: { id: 1 }
        });

        // validate
        expect(addUsersStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(409);
        expect(response.statusMessage).to.equal('Conflict');
        expect(response.result.message).to.equal(NSError.RESOURCE_DUPLICATE().message);
    });

    it('handles server error while adding a user to a role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addUsersStub.restore();
        };

        // setup
        const addUsersStub = Sinon.stub(RoleService, 'addUsers');
        addUsersStub.rejects(NSError.RESOURCE_UPDATE());
        server.route({ method: 'PUT', path: '/role/{id}/users', handler: RoleCtrl.addUsers });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/0/users',
            payload: { id: 1 }
        });

        // validate
        expect(addUsersStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('removes a user from an existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            removeUsersStub.restore();
        };

        // setup
        const removeUsersStub = Sinon.stub(RoleService, 'removeUsers');
        removeUsersStub.withArgs(0, 1).resolves([1]);
        server.route({ method: 'DELETE', path: '/role/{id}/users', handler: RoleCtrl.removeUsers });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/role/0/users',
            payload: { id: 1 }
        });

        // validate
        expect(removeUsersStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(204);
        expect(response.statusMessage).to.equal('No Content');
        expect(response.result).to.not.exist();
    });

    it('removes multiple users from an existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            removeUsersStub.restore();
        };

        // setup
        const removeUsersStub = Sinon.stub(RoleService, 'removeUsers');
        removeUsersStub.withArgs(3, [2, 3]).resolves([1, 1]);
        server.route({ method: 'DELETE', path: '/role/{id}/users', handler: RoleCtrl.removeUsers });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/role/3/users',
            payload: { id: [2, 3] }
        });

        // validate
        expect(removeUsersStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(204);
        expect(response.statusMessage).to.equal('No Content');
        expect(response.result).to.not.exist();
    });

    it('handles removing a non existing user or from non existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            removeUsersStub.restore();
        };

        // setup
        const removeUsersStub = Sinon.stub(RoleService, 'removeUsers');
        removeUsersStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'DELETE', path: '/role/{id}/users', handler: RoleCtrl.removeUsers });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/role/0/users',
            payload: { id: 1 }
        });

        // validate
        expect(removeUsersStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles server error while removing user from role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            removeUsersStub.restore();
        };

        // setup
        const removeUsersStub = Sinon.stub(RoleService, 'removeUsers');
        removeUsersStub.rejects(NSError.RESOURCE_DELETE());
        server.route({ method: 'DELETE', path: '/role/{id}/users', handler: RoleCtrl.removeUsers });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/role/0/users',
            payload: { id: 1 }
        });

        // validate
        expect(removeUsersStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('adds permission to an existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addPermissionStub.restore();
        };

        // setup
        const fakeMappings = { roleId: 1, permissionId: 1 };
        const addPermissionStub = Sinon.stub(RoleService, 'addPermission');
        addPermissionStub.withArgs(1, 'read', 'user').resolves(fakeMappings);
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.addPermission
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/1/permissions',
            payload: { action: 'read', resource: 'user' }
        });

        // validate
        expect(addPermissionStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equals(fakeMappings);
    });

    it('handles adding a permission to a non existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addPermissionStub.restore();
        };

        // setup
        const addPermissionStub = Sinon.stub(RoleService, 'addPermission');
        addPermissionStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.addPermission
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/2/permissions',
            payload: { action: 'read', resource: 'user' }
        });

        // validate
        expect(addPermissionStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles adding a permission to a role that already contains it', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addPermissionStub.restore();
        };

        // setup
        const addPermissionStub = Sinon.stub(RoleService, 'addPermission');
        addPermissionStub.rejects(NSError.RESOURCE_DUPLICATE());
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.addPermission
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/2/permissions',
            payload: { action: 'read', resource: 'user' }
        });

        // validate
        expect(addPermissionStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(409);
        expect(response.statusMessage).to.equal('Conflict');
        expect(response.result.message).to.equal(NSError.RESOURCE_DUPLICATE().message);
    });

    it('handles server error while adding a permission to a role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addPermissionStub.restore();
        };

        // setup
        const addPermissionStub = Sinon.stub(RoleService, 'addPermission');
        addPermissionStub.rejects(NSError.RESOURCE_UPDATE());
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.addPermission
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/1/permissions',
            payload: { action: 'read', resource: 'user' }
        });

        // validate
        expect(addPermissionStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('updates permissions for an existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updatePermissionsStub.restore();
        };

        // setup
        const updatePermissionsStub = Sinon.stub(RoleService, 'updatePermissions');
        const fakeResult = 'fake result';
        updatePermissionsStub.withArgs(1, [1, 2, 3]).resolves(fakeResult);
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.updatePermissions
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/1/permissions',
            payload: { id: [1, 2, 3] }
        });

        // validate
        expect(updatePermissionsStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(204);
        expect(response.statusMessage).to.equal('No Content');
        expect(response.result).to.not.exist();
    });

    it('handles updating permissions for non existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updatePermissionsStub.restore();
        };

        // setup
        const errorMessage = 'Invalid role id';
        const updatePermissionsStub = Sinon.stub(RoleService, 'updatePermissions');
        updatePermissionsStub.rejects(NSError.RESOURCE_NOT_FOUND(errorMessage));
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.updatePermissions
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/999/permissions',
            payload: { id: [1, 2, 3] }
        });

        // validate
        expect(updatePermissionsStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(errorMessage);
    });

    it('handles updating role with non existing permission', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updatePermissionsStub.restore();
        };

        // setup
        const errorMessage = 'Invalid permission id';
        const updatePermissionsStub = Sinon.stub(RoleService, 'updatePermissions');
        updatePermissionsStub.rejects(NSError.RESOURCE_NOT_FOUND(errorMessage));
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.updatePermissions
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/1/permissions',
            payload: { id: [1, 2, 999] }
        });

        // validate
        expect(updatePermissionsStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal('Invalid permission id');
    });

    it('handles server error while updating role permissions', async flags => {
        // cleanup
        flags.onCleanup = function() {
            updatePermissionsStub.restore();
        };

        // setup
        const updatePermissionsStub = Sinon.stub(RoleService, 'updatePermissions');
        updatePermissionsStub.rejects(NSError.RESOURCE_DELETE());
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.updatePermissions
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/1/permissions',
            payload: { id: [1, 2, 3] }
        });

        // validate
        expect(updatePermissionsStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });
});
