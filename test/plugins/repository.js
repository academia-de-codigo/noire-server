const Hapi = require('hapi');
const Lab = require('lab');
const Sinon = require('sinon');
const Objection = require('objection');
const Repository = require('../../lib/plugins/repository');
const UserModel = require('../../lib/models/user');
const RoleModel = require('../../lib/models/role');

const Model = Objection.Model;
const { afterEach, describe, expect, it } = exports.lab = Lab.script();

describe('Plugin: repository', () => {

    let queryStub;

    afterEach(() => {
        delete Repository.user;
        delete Repository.role;

        if (queryStub && queryStub.restore) {
            queryStub.restore();
        }
    });

    it('creates a repository object for each model present in configuration', async () => {

        // setup
        const options = { models: ['user', 'role'] };
        const server = Hapi.server();

        // exercise
        await server.register({ plugin: Repository, options });

        // validate
        expect(Repository['user']).to.be.an.instanceof(Repository.ModelRepository);
        expect(Repository['user'].model).to.equals(UserModel);
        expect(Repository['role']).to.be.an.instanceof(Repository.ModelRepository);
        expect(Repository['role'].model).to.equals(RoleModel);
    });

    it('should create a repository object for a specific model', async () => {

        // setup
        const server = Hapi.server();

        // exercise
        await server.register(Repository);
        const repository = Repository.create('user');

        // validate
        expect(repository).to.be.an.instanceof(Repository.ModelRepository);
        expect(Repository['user']).to.be.an.instanceof(Repository.ModelRepository);
        expect(repository).to.equals(Repository['user']);
        expect(repository.model).to.equals(UserModel);
    });

    it('should log repository creation', async () => {

        // setup
        const options = { models: ['user', 'role'] };
        const logSpy = Sinon.spy();
        const fakeServer = {
            log: logSpy,
            decorate: function() { }
        };

        // exercise
        await Repository.plugin.register(fakeServer, options);

        // validate
        expect(logSpy.calledTwice).to.be.true();
        expect(logSpy.getCall(0).args[0]).to.be.an.array();
        expect(logSpy.getCall(0).args[0]).to.include('server');
        expect(logSpy.getCall(0).args[0]).to.include('db');
        expect(logSpy.getCall(0).args[0]).to.include('model');
        expect(logSpy.getCall(0).args[0]).to.include('debug');
        expect(logSpy.getCall(0).args[1]).to.equals(options.models[0]);
        expect(logSpy.getCall(1).args[0]).to.be.an.array();
        expect(logSpy.getCall(1).args[0]).to.include('server');
        expect(logSpy.getCall(1).args[0]).to.include('db');
        expect(logSpy.getCall(1).args[0]).to.include('model');
        expect(logSpy.getCall(1).args[0]).to.include('debug');
        expect(logSpy.getCall(1).args[1]).to.equals(options.models[1]);
    });

    it('should decorate server with repositories', async () => {

        // setup
        const options = { models: ['user', 'role'] };
        const decorateSpy = Sinon.spy();
        const fakeServer = {
            log: function() { },
            decorate: decorateSpy
        };

        // exercise
        await Repository.plugin.register(fakeServer, options);

        // validate
        expect(decorateSpy.calledOnce).to.be.true();
        expect(decorateSpy.getCall(0).args[0]).to.equals('server');
        expect(decorateSpy.getCall(0).args[1]).to.equals('models');
        expect(decorateSpy.getCall(0).args[2]).to.be.an.object();
        expect(decorateSpy.getCall(0).args[2]['user']).to.be.an.instanceof(Repository.ModelRepository);
        expect(decorateSpy.getCall(0).args[2]['user'].model).to.equals(UserModel);
        expect(decorateSpy.getCall(0).args[2]['user']).to.be.an.instanceof(Repository.ModelRepository);
        expect(decorateSpy.getCall(0).args[2]['role'].model).to.equals(RoleModel);
    });

    it('should return a specific record', async () => {

        // setup
        const fakeUser = {
            id: 1
        };
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const findByIdStub = {
            findById: Sinon.stub()
        };
        queryStub = Sinon.stub(Model, 'query').returns(findByIdStub);
        findByIdStub.findById.withArgs(fakeUser.id).resolves(fakeUser);

        // exercise
        const user = await userRepository.findOne(fakeUser.id);
        const called = queryStub.calledOnce;

        // validate
        expect(called).to.be.true();
        expect(user).to.equals(fakeUser);
    });

    it('handles error when querying for specific record', async () => {

        // setup
        const error = 'error';
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        queryStub = Sinon.stub(Model, 'query').returns({
            findById: Sinon.stub().rejects(new Error(error))
        });

        // exercise and validate
        await expect(userRepository.findOne(1)).to.reject(Error, error);
    });

    it('should return all records within limit', async () => {

        // setup
        const fakeUsers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const limitStub = { limit: Sinon.stub() };
        const offsetStub = { offset: Sinon.stub() };
        const orderByStub = { orderBy: Sinon.stub() };
        limitStub.limit.withArgs(UserModel.LIMIT_DEFAULT).returns(offsetStub);
        limitStub.limit.throws(new Error('wrong limit criteria'));
        offsetStub.offset.withArgs(Sinon.match.number).returns(orderByStub);
        offsetStub.offset.throws(new Error('wrong offset criteria'));
        orderByStub.orderBy.withArgs(Sinon.match.string, Sinon.match.string).resolves(fakeUsers);
        orderByStub.orderBy.throws(new Error('wrong orderby criteria'));
        queryStub = Sinon.stub(Model, 'query').returns(limitStub);

        // exercise
        const user = await userRepository.findAll();

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(user).to.equals(fakeUsers);
    });

    it('should return records within limit with a criteria object', async () => {

    });

    /*
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
    */
});
