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
            expect(results.length).to.equals(4);
            expect(results.roles).to.not.exists();
            results.forEach(function(user) {
                expect(user).to.be.instanceof(UserModel);
                expect(user.id).to.exists();
                expect(user.username).to.be.a.string();
                expect(user.email).to.be.a.string();
                expect(user.password).to.not.exists();
            });
            done();
        });
    });

    it('fetch valid user by id', function(done) {

        UserService.findById(1).then(function(result) {
            expect(result).to.be.an.object();
            expect(result).to.be.instanceof(UserModel);
            expect(result.id).to.equals(1);
            expect(result.username).to.equals('admin');
            expect(result.email).to.be.equals('admin@gmail.com');
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

    it('fetch valid user by username', function(done) {

        UserService.findByUserName('admin').then(function(results) {
            expect(results).to.be.an.array();
            expect(results.length).to.equals(1);
            expect(results[0]).to.be.instanceof(UserModel);
            expect(results[0].roles).to.not.exists();
            expect(results[0].id).to.equals(1);
            expect(results[0].username).to.equals('admin');
            expect(results[0].email).to.be.equals('admin@gmail.com');
            expect(results[0].password).to.not.exists();
            done();
        });
    });

    it('fetch invalid user by username', function(done) {

        UserService.findByUserName('invalid user name').then(function(result) {

            expect(result).to.be.an.array();
            expect(result).to.be.empty();
            done();
        });
    });

    it('fetch valid user by name', function(done) {

        UserService.findByName('Admin User').then(function(results) {
            expect(results).to.be.an.array();
            expect(results.length).to.equals(1);
            expect(results[0]).to.be.instanceof(UserModel);
            expect(results[0].roles).to.not.exists();
            expect(results[0].id).to.equals(1);
            expect(results[0].name).to.equals('Admin User');
            expect(results[0].password).to.not.exists();
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

        UserService.findByEmail('admin@gmail.com').then(function(results) {
            expect(results).to.be.an.array();
            expect(results.length).to.equals(1);
            expect(results[0]).to.be.instanceof(UserModel);
            expect(results[0].roles).to.not.exists();
            expect(results[0].id).to.exists();
            expect(results[0].username).to.be.a.string();
            expect(results[0].email).to.be.equals('admin@gmail.com');
            expect(results[0].password).to.not.exists();
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

        UserService.findByUserName('admin').then(function(result) {

            expect(result[0].username).to.equals('admin');
            expect(result[0].active).to.equals(1); //sqlite for true
            UserService.authenticate('admin', 'admin').then(function(result) {

                expect(result).to.equals(fakeToken);
                Auth.getToken.restore();
                done();
            });

        });
    });

    it('should not authenticate inactive user', function(done) {

        UserService.findByUserName('guest').then(function(result) {

            expect(result[0].username).to.equals('guest');
            expect(result[0].active).to.equals(0); // sqlite for false
            UserService.authenticate('guest', 'guest').then(function(result) {

                expect(result).to.not.exists();
            }).catch(function(error) {

                expect(error).to.equals(HSError.AUTH_INVALID_USERNAME);
                done();
            });

        });
    });

    it('should not authenticate invalid username', function(done) {

        UserService.authenticate('x', 'admin').then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(error).to.equals(HSError.AUTH_INVALID_USERNAME);
            done();
        });
    });

    it('should not authenticate invalid password', function(done) {

        UserService.authenticate('admin', 'invalid password').then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(error).to.equals(HSError.AUTH_INVALID_PASSWORD);
            done();
        });
    });

    it('add a new user', function(done) {

        var newUser = {
            username: 'test2',
            email: 'test2@gmail.com',
            password: 'test2',
            active: true
        };

        var cryptSpy = Sinon.spy(Auth, 'crypt').withArgs(newUser.password);
        var txSpy = Sinon.spy(Repository, 'tx');

        UserService.add(newUser).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(cryptSpy.calledOnce).to.be.true();
            expect(result).to.exists();
            expect(result.id).to.exists();
            expect(result.username).to.equals(newUser.username);
            expect(result.email).to.equals(newUser.email);
            expect(result.password).to.exists();
            txSpy.restore();
            Auth.crypt.restore();
            done();
        });
    });

    it('does not add an existing user', function(done) {

        var newUser = {
            username: 'test',
            email: 'test@gmail.com',
            password: 'test',
            active: true
        };

        var txSpy = Sinon.spy(Repository, 'tx');
        UserService.add(newUser).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_DUPLICATE);
            txSpy.restore();
            done();
        });
    });
});
