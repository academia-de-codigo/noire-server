const Lab = require('lab');
const Hapi = require('hapi');
const Knex = require('knex');
const Sinon = require('sinon');
const Objection = require('objection');
const Path = require('path');
const KnexConfig = require(Path.join(process.cwd(), 'knexfile'));
const RoleService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/role'));
const Repository = require(Path.join(process.cwd(), 'lib/plugins/repository'));
const UserModel = require(Path.join(process.cwd(), 'lib/models/user'));
const RoleModel = require(Path.join(process.cwd(), 'lib/models/role'));
const NSError = require(Path.join(process.cwd(), 'lib/errors/nserror'));

const { afterEach, beforeEach, describe, expect, it } = exports.lab = Lab.script();

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
        server.register({ plugin: Repository, options: { models: ['user', 'role', 'resource', 'permission'] } });

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
        const criteria = { sort: 'id', descending: true };

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

    /*
    it('fetch valid role by id', function(done) {

        RoleService.findById(1).then(function(result) {
            expect(result).to.be.an.object();
            expect(result).to.be.instanceof(RoleModel);
            expect(result.id).to.equals(1);
            expect(result.name).to.equals('admin');
            expect(result.description).to.equals('administrator');
            done();
        });
    });

    it('fetch invalid role by id', function(done) {

        RoleService.findById(999).then(function(result) {

            expect(result).to.not.exist();
        }).catch(function(error) {

            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            done();
        });
    });

    it('populate user associations when fetching role by id', function(done) {
        RoleService.findById(2).then(function(result) {
            expect(result).to.be.instanceof(RoleModel);
            expect(result.users).to.be.an.array();
            expect(result.users.length).to.equals(2);
            result.users.forEach(function(user) {
                expect(user).to.be.instanceof(UserModel);
                expect(user.id).to.exists();
                expect(user.username).to.be.a.string();
                expect(user.email).to.be.a.string();
                expect(user.password).to.not.exists();
            });
            done();
        });
    });

    it('fetch valid role by name', function(done) {

        RoleService.findByName('admin').then(function(results) {
            expect(results).to.be.an.array();
            expect(results.length).to.equals(1);
            expect(results[0]).to.be.instanceof(RoleModel);
            expect(results[0].users).to.not.exists();
            expect(results[0].id).to.equals(1);
            expect(results[0].name).to.equals('admin');
            done();
        });
    });

    it('fetch invalid role by name', function(done) {

        RoleService.findByName('invalid role name').then(function(result) {

            expect(result).to.be.an.array();
            expect(result).to.be.empty();
            done();
        });
    });

    it('adds a new role', function(done) {

        var role = {
            name: 'newrole',
            description: 'description'
        };

        var txSpy = Sinon.spy(Repository, 'tx');

        RoleService.add(role).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(txSpy.args[0].length).to.equals(2);
            expect(txSpy.args[0][0]).to.equals(RoleModel);
            expect(result).to.be.an.instanceof(RoleModel);
            expect(result.id).to.exists();
            expect(result.name).to.equals(role.name);
            expect(result.description).to.equals(role.description);
            txSpy.restore();
            done();
        });
    });

    it('does not add an existing role', function(done) {

        var role = {
            name: 'admin'
        };

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.add(role).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_DUPLICATE);
            txSpy.restore();
            done();
        });
    });

    it('deletes an existing role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.delete(4).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.not.exists();
            txSpy.restore();
            done();
        });
    });

    it('does not delete a non existing role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.delete(100).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('updates an existing role', function(done) {

        var id = 4;
        var role = {
            name: 'newname'
        };

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.update(id, role).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.be.an.instanceof(RoleModel);
            expect(result.id).to.equals(id);
            expect(result.name).to.equals(role.name);
            txSpy.restore();
            done();
        });
    });

    it('updates an existing role with same name and id as request parameters string', function(done) {

        var id = '4';
        var role = {
            name: 'guest2'
        };

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.update(id, role).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.be.an.instanceof(RoleModel);
            expect(result.id).to.equals(Number.parseInt(id));
            expect(result.name).to.equals(role.name);
            txSpy.restore();
            done();
        });
    });

    it('updates an existing role with same name', function(done) {

        var id = 4;
        var role = {
            name: 'guest2'
        };

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.update(id, role).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.be.an.instanceof(RoleModel);
            expect(result.id).to.equals(id);
            expect(result.name).to.equals(role.name);
            txSpy.restore();
            done();
        });
    });

    it('does not update a non existing role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.update(100, {
            name: 'non existing role'
        }).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not update a role with same name as an existing role', function(done) {

        var id = 4;
        var role = {
            name: 'admin'
        };
        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.update(id, role).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_DUPLICATE);
            txSpy.restore();
            done();
        });
    });

    it('adds one user to role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUsers(4, 2).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.be.an.array();
            expect(result.length).to.equals(1);
            expect(result[0]).instanceof(Objection.Model);
            expect(result[0].role_id).to.equals(4);
            expect(result[0].user_id).to.equals(2);
            txSpy.restore();
            done();
        });
    });

    it('adds multiple users to role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUsers(4, [1, 2, 3]).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.be.an.array();
            expect(result.length).to.equals(3);
            result.forEach(function(model) {
                expect(model).instanceof(Objection.Model);
                expect(model.role_id).to.equals(4);
            });
            expect(result.map(function(model) {
                return model.user_id;
            })).to.equals([1, 2, 3]);
            txSpy.restore();
            done();
        });
    });

    it('does not add user to non existing role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUsers(100, 2).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not add non existing user to role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUsers(4, 100).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not add any user to role if at least one of the users does not exist', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUsers(4, [1, 2, 3, 100]).then(function(result) {

            expect(result).to.not.exists();
        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not add user to role which already contains user', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUsers(1, 1).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_DUPLICATE);
            txSpy.restore();
            done();
        });
    });

    it('does not add any user to role which already contains at least one of the users', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUsers(1, [1, 2, 3]).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_DUPLICATE);
            txSpy.restore();
            done();
        });
    });

    it('removes one user from role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removeUsers(1, 1).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.equals([1]);
            txSpy.restore();
            done();
        });
    });

    it('removes multiple users from role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removeUsers(3, [2, 3]).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result.length).to.equals(2);
            txSpy.restore();
            done();
        });
    });

    it('does not remove user from non existing role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removeUsers(5, 1).then(function(result) {

            expect(result).to.not.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not remove non existing user from role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removeUsers(3, 99).then(function(result) {

            expect(result).to.no.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not remove any user from role if at least one user does not exist', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removeUsers(1, [99, 2, 3]).then(function(result) {

            expect(result).to.no.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not remove non related user from role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removeUsers(4, 1).then(function(result) {

            expect(result).to.not.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();

        });
    });

    it('does not remove any user from role if at least one is unrelated', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removeUsers(2, [1, 2, 3]).then(function(result) {

            expect(result).to.not.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();

        });
    });

    it('adds a new permission', function(done) {

        var action = 'create';
        var resource = 'test';
        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addPermission(1, action, resource).then(function(result) {

            expect(result).instanceof(Objection.Model);
            expect(result.role_id).to.equals(1);
            expect(result.permission_id).to.equals(10);

            Repository.permission.model.query().findById(10).eager('resource').then(function(permission) {

                expect(permission.id).to.be.a.number();
                expect(permission.action).to.equals(action);
                expect(permission.resource).to.exists();
                expect(permission.resource.id).to.equals(permission.resource_id);
                txSpy.restore();
                done();
            });
        });
    });

    it('adds a permission that already belongs to a role', function(done) {

        var action = 'create';
        var resource = 'role';
        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addPermission(1, action, resource).then(function(result) {

            expect(result).to.not.exists();
        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_DUPLICATE);
            txSpy.restore();
            done();
        });
    });

    it('adds a permission that already exists but is not used by the role', function(done) {

        var action = 'read';
        var resource = 'noroles';
        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addPermission(1, action, resource).then(function(result) {

            expect(result).instanceof(Objection.Model);
            expect(result.role_id).to.equals(1);
            expect(result.permission_id).to.equals(9);

            Repository.permission.model.query().findById(9).eager('resource').then(function(permission) {

                expect(permission.id).to.be.a.number();
                expect(permission.action).to.equals(action);
                expect(permission.resource).to.exists();
                expect(permission.resource.id).to.equals(permission.resource_id);
                txSpy.restore();
                done();
            });
        });
    });

    it('handles adding a permission to a non existing role', function(done) {

        RoleService.addPermission(999, 'create', 'role').then(function(result) {

            expect(result).to.not.exists();
        }).catch(function(error) {

            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            done();
        });
    });

    it('handles adding a permission with invalid action', function(done) {

        RoleService.addPermission(1, 'invalid', 'role').then(function(result) {

            expect(result).to.not.exists();
        }).catch(function(error) {

            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            done();
        });
    });

    it('handles adding a permission with invalid resource', function(done) {

        RoleService.addPermission(1, 'create', 'invalid').then(function(result) {

            expect(result).to.not.exists();
        }).catch(function(error) {

            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            done();
        });
    });

    it('removes permission from role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removePermissions(1, 1).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.equals([1]);
            txSpy.restore();
            done();

        });
    });

    it('removes multiple permissions from role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removePermissions(2, [2, 3, 6]).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result.length).to.equals(3);
            txSpy.restore();
            done();
        });
    });

    it('does not remove permission from non existing role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removePermissions(5, 1).then(function(result) {

            expect(result).to.not.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not remove non existing permission from role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removePermissions(1, 99).then(function(result) {

            expect(result).to.not.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not remove any permission from role if at least one permission does not exist', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removePermissions(1, [1, 2, 3, 99]).then(function(result) {

            expect(result).to.not.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not remove non related permission from role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removePermissions(2, 4).then(function(result) {

            expect(result).to.not.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();

        });
    });

    it('does not remove any permission from role if at least one is unrelated', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removePermissions(2, [2, 3, 4]).then(function(result) {

            expect(result).to.not.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });
    */
});
