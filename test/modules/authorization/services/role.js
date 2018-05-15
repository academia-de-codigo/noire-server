const Lab = require('lab');
const Hapi = require('hapi');
const Knex = require('knex');
const Sinon = require('sinon');
const Objection = require('objection');
const KnexConfig = require('knexfile');
const RoleService = require('modules/authorization/services/role');
const Repository = require('plugins/repository');
const UserModel = require('models/user');
const RoleModel = require('models/role');
const PermissionModel = require('models/permission');
const ResourceModel = require('models/resource');
const NSError = require('errors/nserror');
const Logger = require('test/fixtures/logger-plugin');

const { afterEach, beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Service: role', function() {
    let txSpy;

    beforeEach(async () => {
        /*jshint -W064 */
        const knex = Knex(KnexConfig.testing); // eslint-disable-line
        /*jshint -W064 */

        await knex.migrate.latest();
        await knex.seed.run();

        Objection.Model.knex(knex);

        const server = Hapi.server();
        server.register(Logger);
        server.register({
            plugin: Repository,
            options: { models: ['user', 'role', 'resource', 'permission'] }
        });

        txSpy = Sinon.spy(Repository, 'tx');
    });

    afterEach(() => {
        if (txSpy) {
            txSpy.restore();
        }
    });

    it('counts roles', async () => {
        // exercise
        const result = await RoleService.count();

        // validate
        expect(result).to.equals(4);
    });

    it('counts roles with a search criteria', async () => {
        // setup
        const criteria = { search: 'administrator' };

        // exercise
        const result = await RoleService.count(criteria);

        // validate
        expect(result).to.equals(1);
    });

    it('lists roles', async () => {
        // exercise
        const results = await RoleService.list();

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        expect(results.users).to.not.exists();
        results.forEach(role => {
            expect(role).to.be.instanceof(RoleModel);
            expect(role.id).to.exists();
            expect(role.name).to.be.a.string();
        });
    });

    it('lists roles with a search clause', async () => {
        // setup
        const criteria = { search: 'adm' };

        // exercise
        const results = await RoleService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(1);
        expect(results.users).to.not.exists();
        expect(results[0]).to.be.instanceof(RoleModel);
        expect(results[0].id === 1).to.be.true();
        expect(results[0].name).to.be.a.string();
    });

    it('lists roles with limit', async () => {
        // setup
        const criteria = { limit: 2 };

        // exercise
        const results = await RoleService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(2);
        expect(results.users).to.not.exists();
        results.forEach(role => {
            expect(role).to.be.instanceof(RoleModel);
            expect(role.id).to.exists();
            expect(role.name).to.be.a.string();
        });
    });

    it('lists roles with offset', async () => {
        // setup
        const criteria = { page: 4, limit: 1 };

        // exercise
        const results = await RoleService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(1);
        expect(results.users).to.not.exist();
        results.forEach(role => {
            expect(role).to.be.instanceof(RoleModel);
            expect(role.id > 3).to.be.true();
            expect(role.name).to.be.a.string();
        });
    });

    it('lists roles ordered by column', async () => {
        // setup
        const criteria = { sort: 'name' };

        // exercise
        const results = await RoleService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        expect(results.users).to.not.exist();
        results.forEach(role => {
            expect(role).to.be.instanceof(RoleModel);
            expect(role.id).to.exists();
            expect(role.name).to.be.a.string();
        });
    });

    it('lists roles ordered by column descending', async () => {
        // setup
        const criteria = { sort: '-id' };

        // exercise
        const results = await RoleService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        expect(results.users).to.not.exist();
        expect(results[0].id > results[1].id).to.be.true();
        results.forEach(role => {
            expect(role).to.be.instanceof(RoleModel);
            expect(role.id).to.exists();
            expect(role.name).to.be.a.string();
        });
    });

    it('gets valid role by id', async () => {
        // setup
        const id = 1;
        const role = { name: 'admin', description: 'administrator' };

        // exercise
        const result = await RoleService.findById(id);

        // validate
        expect(result).to.be.an.object();
        expect(result).to.be.instanceof(RoleModel);
        expect(result.id).to.equals(1);
        expect(result.name).to.equals(role.name);
        expect(result.description).to.equals(role.description);
    });

    it('handles getting invalid role by id', async () => {
        // exercise and validate
        await expect(RoleService.findById(999)).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('gets valid role by name', async () => {
        // setup
        const role = { id: 1, name: 'admin', description: 'administrator' };

        // exercise
        const result = await RoleService.findByName('admin');
        expect(result).to.be.instanceof(RoleModel);
        expect(result.users).to.not.exists();
        expect(result.permissions).to.not.exists();
        expect(result.id).to.equals(role.id);
        expect(result.name).to.equals(role.name);
        expect(result.description).to.equals(role.description);
    });

    it('handles getting invalid role by name', async () => {
        // exercise and validate
        await expect(RoleService.findByName('invalid')).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('adds a new role', async () => {
        // setup
        const role = { name: 'newrole', description: 'description' };

        // exercise
        const result = await RoleService.add(role);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(2);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(result).to.be.an.instanceof(RoleModel);
        expect(result.id).to.exists();
        expect(result.name).to.equals(role.name);
        expect(result.description).to.equals(role.description);
    });

    it('does not add an existing role', async () => {
        // exercise and validate
        await expect(RoleService.add({ name: 'admin' })).to.reject(
            Error,
            NSError.RESOURCE_DUPLICATE().message
        );
    });

    it('deletes an existing role', async () => {
        // exercise
        const result = await RoleService.delete(4);

        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(2);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(result).to.not.exists();
    });

    it('does not delete a non existing role', async () => {
        // exercise and validate
        await expect(RoleService.delete(9999)).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('does not delete a role with associations to users', async () => {
        // exercise and validate
        await expect(RoleService.delete(2)).to.reject(Error, NSError.RESOURCE_RELATION().message);
    });

    it('updates an existing role', async () => {
        // setup
        const id = 4;
        const role = { name: 'newname', description: 'newdescription' };

        // exercise
        const result = await RoleService.update(id, role);

        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(2);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(result).to.be.an.instanceof(RoleModel);
        expect(result.id).to.equals(id);
        expect(result.name).to.equals(role.name);
        expect(result.description).to.equals(role.description);
    });

    it('updates an existing role without updating the name', async () => {
        // setup
        const id = 4;
        const role = { description: 'newdescription' };

        // exercise
        const result = await RoleService.update(id, role);

        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(2);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(result).to.be.an.instanceof(RoleModel);
        expect(result.id).to.equals(id);
        expect(result.name).to.equals('guest2');
        expect(result.description).to.equals(role.description);
    });

    it('updates an existing role with same name', async () => {
        // setup
        const id = 4;
        const role = { name: 'guest2' };

        // exercise
        const result = await RoleService.update(id, role);

        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(2);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(result).to.be.an.instanceof(RoleModel);
        expect(result.id).to.equals(id);
        expect(result.name).to.equals(role.name);
    });

    it('handles updating a non existing role', async () => {
        // exercise and validate
        await expect(RoleService.update(9999, {})).to.reject(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('does not update a role with same name as an existing role', async () => {
        // exercise and validate
        await expect(RoleService.update(4, { name: 'admin' })).to.reject(
            NSError.RESOURCE_DUPLICATE().message
        );
    });

    it('adds a user to a role', async () => {
        // setup
        const roleId = 4;
        const userIds = 2;

        // exercise
        const result = await RoleService.addUsers(4, 2);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(3);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(txSpy.args[0][1]).to.equals(UserModel);
        expect(result).to.be.an.array();
        expect(result.length).to.equals(1);
        expect(result[0]).instanceof(Objection.Model);
        expect(result[0].role_id).to.equals(roleId);
        expect(result[0].user_id).to.equals(userIds);
    });

    it('adds multiple users to role', async () => {
        // setup
        const roleId = 4;
        const userIds = [1, 2, 3];

        // exercise
        const result = await RoleService.addUsers(4, [1, 2, 3]);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(3);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(txSpy.args[0][1]).to.equals(UserModel);
        expect(result).to.be.an.array();
        expect(result.length).to.equals(userIds.length);
        result.forEach(model => {
            expect(model).instanceof(Objection.Model);
            expect(model.role_id).to.equals(roleId);
        });
        expect(result.map(model => model.user_id)).to.equals(userIds);
    });

    it('handles adding user to non existing role', async () => {
        // exercise and validate
        await expect(RoleService.addUsers(9999, 2)).to.reject(Error, 'Invalid role id');
    });

    it('handles adding non existing user to role', async () => {
        // exercise and validate
        await expect(RoleService.addUsers(4, 999)).to.reject(Error, 'Invalid user id');
    });

    it('does not add any user to role if at least one of the users does not exist', async () => {
        // exercise and validate
        await expect(RoleService.addUsers(4, [1, 2, 3, 9999])).to.reject(Error, 'Invalid user id');
    });

    it('does not add any user to role if at least one of the users already contains the role', async () => {
        // exercise and validate
        await expect(RoleService.addUsers(1, [1, 2])).reject(NSError.RESOURCE_DUPLICATE().message);
    });

    it('removes one user from role', async () => {
        // exercise
        const result = await RoleService.removeUsers(1, 1);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(3);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(txSpy.args[0][1]).to.equals(UserModel);
        expect(result).to.equals([1]);
    });

    it('removes multiple users from role', async () => {
        // exercise
        const result = await RoleService.removeUsers(3, [2, 3]);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(3);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(txSpy.args[0][1]).to.equals(UserModel);
        expect(result.length).to.equals(2);
    });

    it('handles removing user from non existing role', async () => {
        // exercise and validate
        await expect(RoleService.removeUsers(5, 1)).reject(Error, 'Invalid role id');
    });

    it('handles removing non existing user from role', async () => {
        // exercise and validate
        await expect(RoleService.removeUsers(3, 9999)).reject(Error, 'Invalid user id');
    });

    it('does not remove any user from role if at least one user does not exist', async () => {
        // exercise and validate
        await expect(RoleService.removeUsers(1, [99, 2, 3])).reject(Error, 'Invalid user id');
    });

    it('handles removing non related user from role', async () => {
        // exercise and validate
        await expect(RoleService.removeUsers(4, 1)).reject(Error, 'User not in role');
    });

    it('does not remove any user from role if at least one is unrelated', async () => {
        // exercise and validate
        await expect(RoleService.removeUsers(2, [1, 2, 3])).reject(Error, 'User not in role');
    });

    it('adds a new permission', async () => {
        // setup
        const roleId = 1;
        const resource = 'test';
        const permission = { id: 10, action: 'create' };

        // exercise
        const result = await RoleService.addPermissions(roleId, permission.action, resource);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(4);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(txSpy.args[0][1]).to.equals(PermissionModel);
        expect(txSpy.args[0][2]).to.equals(ResourceModel);
        expect(result).instanceof(Objection.Model);
        expect(result.role_id).to.equals(roleId);
        expect(result.permission_id).to.equals(permission.id);
    });

    it('does not add a permission that already belongs to a role', async () => {
        // exercise and validate
        await expect(RoleService.addPermissions(1, 'create', 'role')).reject(
            NSError.RESOURCE_DUPLICATE().message
        );
    });

    it('adds a permission that already exists but is not used by the role', async () => {
        // setup
        const roleId = 1;
        const resource = 'noroles';
        const permisison = { action: 'read' };

        // exercise
        const result = await RoleService.addPermissions(roleId, permisison.action, resource);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(4);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(txSpy.args[0][1]).to.equals(PermissionModel);
        expect(txSpy.args[0][2]).to.equals(ResourceModel);
        expect(result).instanceof(Objection.Model);
        expect(result.role_id).to.equals(1);
        expect(result.permission_id).to.equals(9);
    });

    it('does not add a permission to a non existing role', async () => {
        // exercise and validate
        await expect(RoleService.addPermissions(999, 'create', 'role')).reject('Invalid role id');
    });

    it('does not add a permission with invalid action', async () => {
        // exercise and validate
        await expect(() => RoleService.addPermissions(1, 'invalid', 'role')).throws(
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('does not add a permission with invalid resource', async () => {
        // exercise and validate
        await expect(RoleService.addPermissions(1, 'create', 'invalid')).reject(
            Error,
            'Invalid resource id'
        );
    });

    it('removes a permission from role', async () => {
        // exercise
        const result = await RoleService.removePermissions(1, 1);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(3);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(txSpy.args[0][1]).to.equals(PermissionModel);
        expect(result).to.equals([1]);
    });

    it('removes multiple permissions from role', async () => {
        // exercise
        const result = await RoleService.removePermissions(2, [2, 3, 6]);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(3);
        expect(txSpy.args[0][0]).to.equals(RoleModel);
        expect(txSpy.args[0][1]).to.equals(PermissionModel);
        expect(result.length).to.equals(3);
    });

    it('does not remove permission from non existing role', async () => {
        // exercise and validate
        await expect(RoleService.removePermissions(5, 1)).reject(Error, 'Invalid role id');
    });

    it('does not remove non existing permission from role', async () => {
        // exercise and validate
        await expect(RoleService.removePermissions(1, 99)).reject(Error, 'Invalid permission id');
    });

    it('does not remove any permission from role if at least one permission does not exist', async () => {
        // exercise and validate
        await expect(RoleService.removePermissions(1, [1, 2, 3, 99])).reject(
            Error,
            'Invalid permission id'
        );
    });

    it('does not remove non related permission from role', async () => {
        // exercise and validate
        await expect(RoleService.removePermissions(2, 4)).reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('does not remove any permission from role if at least one is unrelated', async () => {
        // exercise and validate
        await expect(RoleService.removePermissions(2, [2, 3, 4])).reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });
});
