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
            models: ['user', 'role']
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

        RoleService.findById(9000).then(function(result) {

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
            id: 10,
            name: 'newrole'
        };

        var txSpy = Sinon.spy(Repository, 'tx');

        RoleService.add(role).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(txSpy.args[0].length).to.equals(2);
            expect(txSpy.args[0][0]).to.equals(RoleModel);
            expect(result).to.be.an.instanceof(RoleModel);
            expect(result.id).to.equals(role.id);
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

        var role = {
            id: 4,
            name: 'newname'
        };

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.update(role.id, role).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.be.an.instanceof(RoleModel);
            expect(result.id).to.equals(role.id);
            expect(result.name).to.equals(role.name);
            txSpy.restore();
            done();
        });
    });

    it('does not update a non existing role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.update(100, {}).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not update a role with same name as an existing role', function(done) {

        var role = {
            id: 4,
            name: 'admin'
        };
        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.update(role.id, role).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_DUPLICATE);
            txSpy.restore();
            done();
        });
    });

    it('adds user to role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUser(4, 2).then(function(result) {

            expect(result).to.equals(2);
            txSpy.restore();
            done();
        });
    });

    it('does not add user to non existing role', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        RoleService.addUser(100, 2).then(function(result) {

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
        RoleService.addUser(4, 100).then(function(result) {

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
        RoleService.addUser(1, 1).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_DUPLICATE);
            txSpy.restore();
            done();
        });
    });

});
