'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Knex = require('knex');
var Sinon = require('sinon');
var Objection = require('objection');
var KnexConfig = require('../../knexfile');
var RoleService = require('../../lib/services/role');
var Repository = require('../../lib/plugins/repository');
var UserModel = require('../../lib/models/user');
var RoleModel = require('../../lib/models/role');
var HSError = require('../../lib/error');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var beforeEach = lab.beforeEach;
var expect = Code.expect;


describe('Service: role', function() {

    var knex;

    beforeEach(function(done) {

        var options = {
            models: ['user', 'role', 'resource', 'permission']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        /*jshint -W064 */
        knex = Knex(KnexConfig.testing); // eslint-disable-line
        /*jshint -W064 */

        knex.migrate.latest().then(function() {

            return knex.seed.run();

        }).then(function() {

            Objection.Model.knex(knex);
            Repository.register(fakeServer, options, function() {

                done();
            });
        });
    });

    it('counts roles', function(done) {

        RoleService.count().then(function(result) {

            expect(result).to.equals(4);
            done();
        });
    });

    it('lists roles', function(done) {

        RoleService.list().then(function(results) {

            expect(results).to.be.an.array();
            expect(results.length).to.equals(4);
            expect(results.users).to.not.exists();
            results.forEach(function(role) {
                expect(role).to.be.instanceof(RoleModel);
                expect(role.id).to.exists();
                expect(role.name).to.be.a.string();
            });
            done();
        });
    });

    it('fetch valid role by id', function(done) {

        RoleService.findById(1).then(function(result) {
            expect(result).to.be.an.object();
            expect(result).to.be.instanceof(RoleModel);
            expect(result.id).to.equals(1);
            expect(result.name).to.equals('admin');
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
            name: 'newrole'
        };

        var txSpy = Sinon.spy(Repository, 'tx');

        RoleService.add(role).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(txSpy.args[0].length).to.equals(2);
            expect(txSpy.args[0][0]).to.equals(RoleModel);
            expect(result).to.be.an.instanceof(RoleModel);
            expect(result.id).to.exists();
            expect(result.name).to.equals(role.name);
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

    it('does not delete a role with user relations', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.delete(1).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_RELATION);
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

    it('adds user (with id as integer) to role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUsers(4, 2).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.equals([2]);
            txSpy.restore();
            done();
        });
    });

    it('adds severall users (with array of integers) to role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUsers(4, [1,2,3]).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.equals([1,2,3]);
            txSpy.restore();
            done();
        });
    });

    it('does not add user to non existing role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUsers(100, [2]).then(function(result) {

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

    it('removes user from role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removeUser(1, 1).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.equals({});
            txSpy.restore();
            done();
        });
    });

    it('does not remove user from non existing role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removeUser(5, 1).then(function(result) {

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
        RoleService.removeUser(1, 99).then(function(result) {

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
        RoleService.removeUser(4, 1).then(function(result) {

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

            expect(result).to.be.a.number();

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

            expect(result).to.be.a.number();

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
        RoleService.removePermission(1, 1).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.equals({});
            txSpy.restore();
            done();

        });
    });

    it('does not remove permission from non existing role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removePermission(5, 1).then(function(result) {

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
        RoleService.removePermission(1, 99).then(function(result) {

            expect(result).to.no.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not remove non related permission from role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.removePermission(2, 4).then(function(result) {

            expect(result).to.not.exist();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();

        });
    });

});
