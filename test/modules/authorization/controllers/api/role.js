const Hoek = require('hoek');
const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const RoleService = require('modules/authorization/services/role');
const RoleCtrl = require('modules/authorization/controllers/api/role');
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
        expect(JSON.parse(response.payload)).to.equal(roles);
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
        expect(JSON.parse(response.payload)).to.equal(roles);
    });

    it('handles server errors while listing roles', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
        };

        // setup
        const listStub = Sinon.stub(RoleService, 'list');
        listStub.rejects(NSError.RESOURCE_FETCH());
        server.route({ method: 'GET', path: '/role', handler: RoleCtrl.list });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/role'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(500);
        expect(response.statusMessage).to.equals('Internal Server Error');
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
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
        expect(JSON.parse(response.payload)).to.equal(roles[1]);
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
        expect(JSON.parse(response.payload).message).to.equals(
            NSError.RESOURCE_NOT_FOUND().message
        );
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
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
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
        expect(JSON.parse(response.payload).id).to.equals(fakeId);
        expect(JSON.parse(response.payload).name).to.equals(entity.name);
        expect(JSON.parse(response.payload).description).to.equals(entity.description);
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
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_DUPLICATE().message);
    });

    it('handles server errors while creating a role', async flags => {
        // setup
        const addStub = Sinon.stub(RoleService, 'add');
        addStub.rejects(NSError.RESOURCE_INSERT());
        server.route({ method: 'POST', path: '/role', handler: RoleCtrl.create });
        flags.onCleanup = function() {
            addStub.restore();
        };

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/role'
        });

        // validate
        expect(addStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
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
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
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
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
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
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
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
        expect(JSON.parse(response.payload).password).to.not.exists();
        expect(JSON.parse(response.payload).id).to.equals(fakeId);
        expect(JSON.parse(response.payload).name).to.equals(entity.name);
        expect(JSON.parse(response.payload).description).to.equals(entity.description);
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
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
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
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_DUPLICATE().message);
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
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
    });

    it('adds user to an existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addUsersStub.restore();
        };

        // setup
        const fakeMappings = { role_id: 0, user_id: 1 };
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
        expect(JSON.parse(response.payload)).to.equals(fakeMappings);
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
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
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
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_DUPLICATE().message);
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
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
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
        expect(response.statusCode).to.equals(200);
        expect(response.statusMessage).to.equal('OK');
        expect(JSON.parse(response.payload)).to.equals([1]);
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
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
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
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
    });

    it('adds permission to an existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addPermissionStub.restore();
        };

        // setup
        const fakeMappings = { role_id: 1, permission_id: 1 };
        const addPermissionStub = Sinon.stub(RoleService, 'addPermissions');
        addPermissionStub.withArgs(1, 'read', 'user').resolves(fakeMappings);
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.addPermissions
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
        expect(JSON.parse(response.payload)).to.equals(fakeMappings);
    });

    it('handles adding a permission to a non existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addPermissionsStub.restore();
        };

        // setup
        const addPermissionsStub = Sinon.stub(RoleService, 'addPermissions');
        addPermissionsStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.addPermissions
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/2/permissions',
            payload: { action: 'read', resource: 'user' }
        });

        // validate
        expect(addPermissionsStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles adding a permission to a role that already contains it', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addPermissionsStub.restore();
        };

        // setup
        const addPermissionsStub = Sinon.stub(RoleService, 'addPermissions');
        addPermissionsStub.rejects(NSError.RESOURCE_DUPLICATE());
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.addPermissions
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/2/permissions',
            payload: { action: 'read', resource: 'user' }
        });

        // validate
        expect(addPermissionsStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(409);
        expect(response.statusMessage).to.equal('Conflict');
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_DUPLICATE().message);
    });

    it('handles server error while adding a permission to a role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            addPermissionsStub.restore();
        };

        // setup
        const addPermissionsStub = Sinon.stub(RoleService, 'addPermissions');
        addPermissionsStub.rejects(NSError.RESOURCE_UPDATE());
        server.route({
            method: 'PUT',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.addPermissions
        });

        // exercise
        const response = await server.inject({
            method: 'PUT',
            url: '/role/1/permissions',
            payload: { action: 'read', resource: 'user' }
        });

        // validate
        expect(addPermissionsStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
    });

    it('removes a permission from an existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            removePermissionsStub.restore();
        };

        // setup
        const removePermissionsStub = Sinon.stub(RoleService, 'removePermissions');
        removePermissionsStub.withArgs(1, 1).resolves([1]);
        server.route({
            method: 'DELETE',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.removePermissions
        });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/role/1/permissions',
            payload: { id: 1 }
        });

        // validate
        expect(removePermissionsStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(200);
        expect(response.statusMessage).to.equal('OK');
        expect(JSON.parse(response.payload)).to.equals([1]);
    });

    it('handles removing a non existing permission or from non existing role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            removePermissionsStub.restore();
        };

        // setup
        const removePermissionsStub = Sinon.stub(RoleService, 'removePermissions');
        removePermissionsStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({
            method: 'DELETE',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.removePermissions
        });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/role/1/permissions',
            payload: { id: 1 }
        });

        // validate
        expect(removePermissionsStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(JSON.parse(response.payload).message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles server error while removing permission from role', async flags => {
        // cleanup
        flags.onCleanup = function() {
            removePermissionsStub.restore();
        };

        // setup
        const removePermissionsStub = Sinon.stub(RoleService, 'removePermissions');
        removePermissionsStub.rejects(NSError.RESOURCE_DELETE());
        server.route({
            method: 'DELETE',
            path: '/role/{id}/permissions',
            handler: RoleCtrl.removePermissions
        });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/role/1/permissions',
            payload: { id: 1 }
        });

        // validate
        expect(removePermissionsStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
    });
});
