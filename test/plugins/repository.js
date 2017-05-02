var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var Objection = require('objection');
var Repository = require('../../lib/plugins/repository');
var UserModel = require('../../lib/models/user');
var RoleModel = require('../../lib/models/role');

var Model = Objection.Model;
var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var afterEach = lab.afterEach;
var it = lab.test;
var expect = Code.expect;

describe('Plugin: repository', function() {

    afterEach(function(done) {
        delete Repository.user;
        delete Repository.role;
        done();
    });

    it('should create a repository object for each model present in configuration', function(done) {

        var options = {
            models: ['user', 'role']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        Repository.register(fakeServer, options, function() {

            expect(Repository['user']).to.be.an.object();
            expect(Repository['user'].model).to.equals(UserModel);
            expect(Repository['role']).to.be.an.object();
            expect(Repository['role'].model).to.equals(RoleModel);
            done();
        });
    });

    it('should create a repository object for a specific model', function(done) {

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        Repository.register(fakeServer, {}, function() {

            Repository.create('user');
            expect(Repository['user']).to.be.an.object();
            expect(Repository['user'].model).to.equals(UserModel);
            done();
        });
    });

    it('should log repository creation', function(done) {

        var options = {
            models: ['user']
        };

        var fakeServer = {
            log: function(tags, model) {
                expect(tags).to.be.an.array();
                expect(tags).to.contains('server');
                expect(tags).to.contains('db');
                expect(tags).to.contains('model');
                expect(tags).to.contains('debug');
                expect(model).to.equals(options.models[0]);
            },
            decorate: function() {}
        };

        Repository.register(fakeServer, options, function() {
            done();
        });
    });

    it('should decorate server with repositories', function(done) {

        var options = {
            models: ['user', 'role']
        };

        var fakeServer = {
            log: function() {},
            decorate: function(type, property, value) {
                expect(type).to.equals('server');
                expect(property).to.equals('models');
                expect(value).to.be.an.object();
                expect(value['user'].model).to.equals(UserModel);
                expect(value['role'].model).to.equals(RoleModel);
            }
        };

        Repository.register(fakeServer, options, function() {

            done();
        });
    });

    it('should return records within limit with no args', function(done) {

        var options = {
            models: ['user']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        Repository.register(fakeServer, options, function() {

            var fakePromise = 'a fake promise';
            var repo = Repository['user'];
            var queryStub = Sinon.stub(Model, 'query').callsFake(function() {
                return {
                    limit: Sinon.stub().withArgs(1).callsFake(function() {
                        return {
                            offset: Sinon.stub().withArgs(2).callsFake(function() {
                                return {
                                    orderBy: Sinon.stub().withArgs(1).returns(fakePromise)
                                };
                            })
                        };
                    })
                };
            });

            expect(repo.findAll()).to.equals(fakePromise);
            Sinon.assert.calledOnce(queryStub);
            queryStub.restore();
            done();
        });
    });

    it('should return records within limit with a criteria object', function(done) {

        var options = {
            models: ['user']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        Repository.register(fakeServer, options, function() {

            var criteria = {};
            var fakePromise = 'a fake promise';
            var repo = Repository['user'];
            var queryStub = Sinon.stub(Model, 'query').callsFake(function() {
                return {
                    limit: Sinon.stub().withArgs(1).callsFake(function() {
                        return {
                            offset: Sinon.stub().withArgs(2).callsFake(function() {
                                return {
                                    orderBy: Sinon.stub().withArgs(1).returns(fakePromise)
                                };
                            })
                        };
                    })
                };
            });

            expect(repo.findAll(criteria)).to.equals(fakePromise);
            Sinon.assert.calledOnce(queryStub);
            queryStub.restore();
            done();
        });
    });

    it('should return records within limit with a number as criteria', function(done) {
        var options = {
            models: ['user']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };
        Repository.register(fakeServer, options, function() {

            var criteria = 1;
            var fakePromise = 'a fake promise';
            var repo = Repository['user'];
            var queryStub = Sinon.stub(Model, 'query').callsFake(function() {
                return {
                    limit: Sinon.stub().withArgs(1).callsFake(function() {
                        return {
                            offset: Sinon.stub().withArgs(2).callsFake(function() {
                                return {
                                    orderBy: Sinon.stub().withArgs(1).returns(fakePromise)
                                };
                            })
                        };
                    })
                };
            });

            expect(repo.findAll(criteria)).to.equals(fakePromise);
            Sinon.assert.calledOnce(queryStub);
            queryStub.restore();
            done();
        });
    });

    it('should return records ordered by a column with a string as criteria', function(done) {
        var options = {
            models: ['user']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };
        Repository.register(fakeServer, options, function() {

            var criteria = 'column';
            var fakePromise = 'a fake promise';
            var repo = Repository['user'];
            var queryStub = Sinon.stub(Model, 'query').callsFake(function() {
                return {
                    limit: Sinon.stub().withArgs(1).callsFake(function() {
                        return {
                            offset: Sinon.stub().withArgs(2).callsFake(function() {
                                return {
                                    orderBy: Sinon.stub().withArgs(1).returns(fakePromise)
                                };
                            })
                        };
                    })
                };
            });

            expect(repo.findAll(criteria)).to.equals(fakePromise);
            Sinon.assert.calledOnce(queryStub);
            queryStub.restore();
            done();
        });
    });

    it('should return a specific record', function(done) {

        var options = {
            models: ['user']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        Repository.register(fakeServer, options, function() {

            var id = 1;
            var fakePromise = 'a fake promise';
            var repo = Repository['user'];
            var queryStub = Sinon.stub(Model, 'query').callsFake(function() {
                return {
                    findById: Sinon.stub().withArgs(1).returns(fakePromise)
                };
            });

            expect(repo.findOne(id)).to.equals(fakePromise);
            Sinon.assert.calledOnce(queryStub);
            queryStub.restore();
            done();
        });
    });

    it('should insert a new record', function(done) {

        var options = {
            models: ['user']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        Repository.register(fakeServer, options, function() {

            var fakeUser = {
                name: 'name'
            };
            var fakePromise = 'a fake promise';
            var repo = Repository['user'];
            var queryStub = Sinon.stub(Model, 'query').callsFake(function() {
                return {
                    insert: Sinon.stub().withArgs(fakeUser).returns(fakePromise)
                };
            });

            expect(repo.add(fakeUser)).to.equals(fakePromise);
            Sinon.assert.calledOnce(queryStub);
            queryStub.restore();
            done();
        });
    });

    it('should update an existing record', function(done) {

        var options = {
            models: ['user']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        Repository.register(fakeServer, options, function() {

            var fakeUser = {
                $query: function() {

                    expect(arguments.length).to.equals(0);
                    return {
                        updateAndFetch: Sinon.stub().withArgs().returns(fakePromise)
                    };
                }
            };
            var fakePromise = 'a fake promise';
            var repo = Repository['user'];

            expect(repo.update(fakeUser)).to.equals(fakePromise);
            done();
        });
    });

    it('should remove a specific record', function(done) {

        var options = {
            models: ['user']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        Repository.register(fakeServer, options, function() {

            var id = 1;
            var fakePromise = 'a fake promise';
            var repo = Repository['user'];
            var queryStub = Sinon.stub(Model, 'query').callsFake(function() {
                return {
                    deleteById: Sinon.stub().withArgs(1).returns(fakePromise)
                };
            });

            expect(repo.remove(id)).to.equals(fakePromise);
            Sinon.assert.calledOnce(queryStub);
            queryStub.restore();
            done();
        });
    });

    it('should perform any knex query', function(done) {

        var options = {
            models: ['user']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        Repository.register(fakeServer, options, function() {

            var fakeQueryBuilder = 'a fake query builder';
            var repo = Repository['user'];
            var queryStub = Sinon.stub(Model, 'query').callsFake(function() {
                return fakeQueryBuilder;
            });

            expect(repo.query()).to.equals(fakeQueryBuilder);
            Sinon.assert.calledOnce(queryStub);
            queryStub.restore();
            done();
        });
    });

    it('should obtain transaction repositories from models', function(done) {

        var options = {
            models: ['user', 'role']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        var fakeTxUserRepo = 'fake tx user repo';
        var fakeTxRoleRepo = 'fake tx role repo';

        var txStub = Sinon.stub(Objection, 'transaction').callsFake(function(userModel, roleModel, cb) {
            cb(fakeTxUserRepo, fakeTxRoleRepo);
        });

        Repository.register(fakeServer, options, function() {

            Repository.tx(UserModel, RoleModel, function(userTxRepo, roleTxRepo) {

                expect(userTxRepo.model).to.equals(fakeTxUserRepo);
                expect(roleTxRepo.model).to.equals(fakeTxRoleRepo);
                txStub.restore();
                done();
            });
        });
    });
});
