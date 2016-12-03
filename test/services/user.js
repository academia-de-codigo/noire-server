'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var Knex = require('knex');
var Objection = require('objection');
var KnexConfig = require('../../knexfile');
var UserService = require('../../lib/services/user');
var Repository = require('../../lib/plugins/repository');
var UserModel = require('../../lib/models/user');
var RoleModel = require('../../lib/models/role');
var Auth = require('../../lib/plugins/auth');
var HSError = require('../../lib/error');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var beforeEach = lab.beforeEach;
var expect = Code.expect;


describe('Service: user', function() {

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

    it('lists users', function(done) {

        UserService.list().then(function(results) {

            expect(results).to.be.an.array();
            expect(results.length).to.equals(3);
            expect(results.roles).to.not.exists();
            results.forEach(function(user) {
                expect(user).to.be.instanceof(UserModel);
                expect(user.id).to.exists();
                expect(user.username).to.be.a.string();
                expect(user.password).to.not.exists();
            });
            done();
        });
    });

    it('fetch valid user by id', function(done) {

        UserService.findById(1).then(function(result) {
            expect(result).to.be.an.object();
            expect(result).to.be.instanceof(UserModel);
            expect(result.id).to.exists();
            expect(result.username).to.be.a.string();
            expect(result.password).to.not.exists();
            done();
        });
    });

    it('fetch invalid user by id', function(done) {

        UserService.findById(9000).then(function(result) {

            expect(result).to.not.exist();
        }).catch(function(error) {

            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            done();
        });
    });

    it('populate role associations when fetching user by id', function(done) {
        UserService.findById(1).then(function(result) {
            expect(result).to.be.instanceof(UserModel);
            expect(result.roles).to.be.an.array();
            expect(result.roles.length).to.equals(3);
            result.roles.forEach(function(role) {
                expect(role).to.be.instanceof(RoleModel);
                expect(role.id).to.exists();
                expect(role.name).to.be.a.string();
            });
            done();
        });
    });

    it('fetch valid user by name', function(done) {

        UserService.findByName('admin').then(function(result) {
            expect(result).to.be.an.array();
            expect(result.length).to.equals(1);
            expect(result[0]).to.be.instanceof(UserModel);
            expect(result[0].roles).to.not.exists();
            expect(result[0].id).to.exists();
            expect(result[0].username).to.be.a.string();
            expect(result[0].password).to.not.exists();
            done();
        });
    });

    it('fetch invalid user by name', function(done) {

        UserService.findByName('invalid user name').then(function(result) {

            expect(result).to.be.an.array();
            expect(result).to.be.empty();
            done();
        });
    });

    it('fetch valid user by email', function(done) {

        UserService.findByEmail('admin@gmail.com').then(function(result) {
            expect(result).to.be.an.array();
            expect(result.length).to.equals(1);
            expect(result[0]).to.be.instanceof(UserModel);
            expect(result[0].roles).to.not.exists();
            expect(result[0].id).to.exists();
            expect(result[0].username).to.be.a.string();
            expect(result[0].password).to.not.exists();
            done();
        });
    });

    it('fetch invalid user by email', function(done) {

        UserService.findByEmail('invalid user email').then(function(result) {

            expect(result).to.be.an.array();
            expect(result).to.be.empty();
            done();
        });
    });

    it('authenticate user with valid credentials', function(done) {

        var fakeToken = 'fake token';
        Sinon.stub(Auth, 'getToken').withArgs(1).returns(fakeToken);

        UserService.authenticate('admin@gmail.com', 'admin').then(function(result) {

            expect(result).to.equals(fakeToken);
            Auth.getToken.restore();
            done();
        });
    });

    it('should not authenticate invalid email', function(done) {

        UserService.authenticate('invalid user email', 'admin').then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(error).to.equals(HSError.AUTH_INVALID_EMAIL);
            done();
        });
    });

    it('should not authenticate invalid password', function(done) {

        UserService.authenticate('admin@gmail.com', 'invalid password').then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(error).to.equals(HSError.AUTH_INVALID_PASSWORD);
            done();
        });
    });

});
