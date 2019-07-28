const Lab = require('@hapi/lab');
const Hapi = require('@hapi/hapi');
const Sinon = require('sinon');
const Objection = require('objection');
const Repository = require('plugins/repository');
const UserModel = require('models/user');
const RoleModel = require('models/role');
const Logger = require('test/fixtures/logger-plugin');

const Model = Objection.Model;
const { afterEach, beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Plugin: repository', () => {
    let server;
    let queryStub;
    let txStub;

    beforeEach(() => {
        server = Hapi.server();
        server.register(Logger);
    });

    afterEach(() => {
        delete Repository.User;
        delete Repository.Role;

        // make sure no stubs are left in the event of unit test failure

        if (queryStub && queryStub.restore) {
            queryStub.restore();
        }

        if (txStub && txStub.restore) {
            txStub.restore();
        }
    });

    it('creates a repository object for each model present in configuration', async () => {
        // setup
        const options = { models: ['user', 'role'] };

        // exercise
        await server.register({ plugin: Repository, options });

        // validate
        expect(Repository['User']).to.be.an.instanceof(Repository.ModelRepository);
        expect(Repository['User'].model).to.equals(UserModel);
        expect(Repository['Role']).to.be.an.instanceof(Repository.ModelRepository);
        expect(Repository['Role'].model).to.equals(RoleModel);
    });

    it('creates a repository object for a specific model', async () => {
        // exercise
        await server.register(Repository);
        const repository = Repository.create('user');

        // validate
        expect(repository).to.be.an.instanceof(Repository.ModelRepository);
        expect(repository.model).to.equals(UserModel);
    });

    it('throws error when creating a repository for invalid model', async () => {
        // exercise
        await server.register(Repository);

        // validate
        // code requires a function as argument to assert exception
        expect(() => Repository.create('invalid')).to.throw();
    });

    it('decorates request with repositories', async () => {
        // setup
        const options = { models: ['user', 'role'] };
        const decorateSpy = Sinon.spy();
        const fakeRequest = { logger: () => Logger.fake, decorate: decorateSpy };

        // exercise
        await Repository.plugin.register(fakeRequest, options);

        // validate
        expect(decorateSpy.calledOnce).to.be.true();
        expect(decorateSpy.getCall(0).args[0]).to.equals('request');
        expect(decorateSpy.getCall(0).args[1]).to.equals('model');
        expect(decorateSpy.getCall(0).args[2]).to.be.an.object();
        expect(decorateSpy.getCall(0).args[2]['User']).to.be.an.instanceof(
            Repository.ModelRepository
        );
        expect(decorateSpy.getCall(0).args[2]['User'].model).to.equals(UserModel);
        expect(decorateSpy.getCall(0).args[2]['User']).to.be.an.instanceof(
            Repository.ModelRepository
        );
        expect(decorateSpy.getCall(0).args[2]['Role'].model).to.equals(RoleModel);
    });

    it('returns a specific record', async () => {
        // setup
        const fakeUser = { id: 1 };
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const findByIdStub = Sinon.stub()
            .withArgs(fakeUser.id)
            .resolves(fakeUser);
        queryStub = Sinon.stub(Model, 'query').returns({ findById: findByIdStub });

        // exercise
        const user = await userRepository.findOne(fakeUser.id);

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(findByIdStub.calledOnce).to.be.true();
        expect(user).to.equals(fakeUser);
    });

    it('handles error when querying for specific record', async () => {
        // setup
        const error = 'error';
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const findByIdStub = Sinon.stub().rejects(new Error(error));
        queryStub = Sinon.stub(Model, 'query').returns({ findById: findByIdStub });

        // exercise and validate
        await expect(userRepository.findOne(1)).to.reject(Error, error);
    });

    it('returns all records within limit', async () => {
        // setup
        const fakeUsers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const limitStub = Sinon.stub();
        const offsetStub = Sinon.stub();
        const searchStub = Sinon.stub();
        const modifyStub = Sinon.stub();
        limitStub.withArgs(UserModel.LIMIT_DEFAULT).returns({ offset: offsetStub });
        offsetStub.withArgs(Sinon.match.number).returns({ search: searchStub });
        searchStub.withArgs().returns({ modify: modifyStub });
        modifyStub.resolves(fakeUsers);
        queryStub = Sinon.stub(Model, 'query').returns({ limit: limitStub });
        limitStub.throws(new Error('wrong limit criteria'));
        offsetStub.throws(new Error('wrong offset criteria'));

        // exercise
        const user = await userRepository.findAll();

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(limitStub.calledOnce).to.be.true();
        expect(offsetStub.calledOnce).to.be.true();
        expect(user).to.equals(fakeUsers);
    });

    it('returns records within limit with a criteria object', async () => {
        // setup
        const fakeUsers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const fakeCriteria = {
            limit: 2,
            page: 2,
            sort: 'field1,-field2,+field3',
            search: 'fakesearch',
            relations: 'fakerelation'
        };
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const limitStub = Sinon.stub();
        const offsetStub = Sinon.stub();
        const orderByStub = Sinon.stub();
        const searchStub = Sinon.stub();
        const modifyStub = Sinon.stub();
        limitStub.withArgs(fakeCriteria.limit).returns({ offset: offsetStub });
        offsetStub.withArgs(Sinon.match.number).returns({ search: searchStub });
        searchStub
            .withArgs(fakeCriteria.search, fakeCriteria.relations)
            .returns({ modify: modifyStub });
        orderByStub.withArgs('field1', 'asc').returns();
        orderByStub.withArgs('field2', 'desc').returns();
        orderByStub.withArgs('field3', 'asc').returns();
        modifyStub.callsFake(cb => {
            cb({ orderBy: orderByStub });
            return fakeUsers;
        });
        queryStub = Sinon.stub(Model, 'query').returns({ limit: limitStub });
        limitStub.throws(new Error('wrong limit criteria'));
        offsetStub.throws(new Error('wrong offset criteria'));
        orderByStub.throws(new Error('wrong orderby criteria'));
        searchStub.throws(new Error('wrong search criteria'));

        // exercise
        const user = await userRepository.findAll(fakeCriteria);

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(limitStub.calledOnce).to.be.true();
        expect(offsetStub.calledOnce).to.be.true();
        expect(searchStub.calledOnce).to.be.true();
        expect(orderByStub.calledThrice).to.be.true();
        expect(user).to.equals(fakeUsers);
    });

    it('handles error when querying for all records', async () => {
        // setup
        const error = 'error';
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const modifyStub = Sinon.stub().rejects(new Error(error));
        const searchStub = Sinon.stub().returns({ modify: modifyStub });
        const offsetStub = Sinon.stub().returns({ search: searchStub });
        const limitStub = Sinon.stub().returns({ offset: offsetStub });
        queryStub = Sinon.stub(Model, 'query').returns({ limit: limitStub });

        // exercise and validate
        await expect(userRepository.findAll()).to.reject(Error, error);
    });

    it('inserts a new record', async () => {
        // setup
        const fakeUser = 'a fake user';
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const insertStub = Sinon.stub();
        insertStub.withArgs(fakeUser).resolves();
        insertStub.rejects(new Error('invalid insert query'));
        queryStub = Sinon.stub(Model, 'query').returns({ insert: insertStub });

        // exercise
        await userRepository.add(fakeUser);

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(insertStub.calledOnce).to.be.true();
    });

    it('handles error inserting new record', async () => {
        // setup
        const error = 'error';
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const insertStub = Sinon.stub().rejects(new Error(error));
        queryStub = Sinon.stub(Model, 'query').returns({ insert: insertStub });

        // exercise and validate
        await expect(userRepository.add('user')).to.reject(Error, error);
    });

    it('updates an existing record', async () => {
        // setup
        const fakeUser = { $query: Sinon.stub() };
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const updateStub = Sinon.stub().resolves();
        fakeUser.$query.returns({ updateAndFetch: updateStub });

        // exercise
        await userRepository.update(fakeUser);

        // validate
        expect(fakeUser.$query.calledOnce).to.be.true();
        expect(updateStub.calledOnce).to.be.true();
    });

    it('handles error updating an exiting record', async () => {
        // setup
        const fakeUser = { $query: Sinon.stub() };
        const error = 'error';
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const updateStub = Sinon.stub().rejects(new Error(error));
        fakeUser.$query.returns({ updateAndFetch: updateStub });

        // exercise and validate
        await expect(userRepository.update(fakeUser)).to.reject(Error, error);
    });

    it('removes an existing record', async () => {
        // setup
        const fakeId = 1;
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const deleteByIdStub = Sinon.stub();
        deleteByIdStub.withArgs(fakeId).resolves();
        deleteByIdStub.rejects(new Error('invalid query'));
        queryStub = Sinon.stub(Model, 'query').returns({ deleteById: deleteByIdStub });

        // exercise
        await userRepository.remove(fakeId);

        // validate
        expect(deleteByIdStub.calledOnce).to.be.true();
        expect(queryStub.calledOnce).to.be.true();
        expect(deleteByIdStub.calledOnce).to.be.true();
    });

    it('handles error removing an exiting record', async () => {
        // setup
        const error = 'error';
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const deleteByIdStub = Sinon.stub().rejects(new Error(error));
        queryStub = Sinon.stub(Model, 'query').returns({ deleteById: deleteByIdStub });

        // exercise and validate
        await expect(userRepository.remove(1)).to.reject(Error, error);
    });

    it('counts the number of records', async () => {
        // setup
        const fakeUserCount = 5;
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const firstStub = Sinon.stub().resolves(fakeUserCount);
        const countStub = Sinon.stub().returns({ first: firstStub });
        queryStub = Sinon.stub(Model, 'query').returns({ count: countStub });

        // exercise
        const userCount = await userRepository.count();

        // exercise and validate
        expect(firstStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(queryStub.calledOnce).to.be.true();
        expect(userCount).to.equals(fakeUserCount);
    });

    it('counts the number of records with search criteria', async () => {
        // setup
        const fakeUserCount = 5;
        const fakeCriteria = { search: 'fakesearch', relations: 'relation' };
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];

        const firstStub = Sinon.stub().resolves(fakeUserCount);
        const asStub = Sinon.stub()
            .withArgs(Sinon.match.string)
            .returns();
        const fromStub = Sinon.stub().returns({ first: firstStub });
        const countStub = Sinon.stub().returns({ from: fromStub, first: firstStub });
        const searchStub = Sinon.stub()
            .withArgs(fakeCriteria.search, fakeCriteria.relations)
            .returns({ as: asStub });
        queryStub = Sinon.stub(Model, 'query')
            .onCall(0)
            .returns({ count: countStub });
        queryStub.onCall(1).returns({ search: searchStub });

        // exercise
        const userCount = await userRepository.count(fakeCriteria);

        // exercise and validate
        expect(firstStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(fromStub.calledOnce).to.be.true();
        expect(asStub.calledOnce).to.be.true();
        expect(queryStub.calledTwice).to.be.true();
        expect(userCount).to.equals(fakeUserCount);
    });

    it('counts the number of records with subquery', async () => {
        // setup
        const fakeUserCount = 5;

        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];

        const firstStub = Sinon.stub().resolves(fakeUserCount);
        const asStub = Sinon.stub()
            .withArgs(Sinon.match.string)
            .returns();
        const fromStub = Sinon.stub().returns({ first: firstStub });
        const countStub = Sinon.stub().returns({ from: fromStub, first: firstStub });
        queryStub = Sinon.stub(Model, 'query')
            .onCall(0)
            .returns({ count: countStub });
        const fakeQuery = { as: asStub };

        // exercise
        const userCount = await userRepository.count({}, fakeQuery);

        // exercise and validate
        expect(firstStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(fromStub.calledOnce).to.be.true();
        expect(asStub.calledOnce).to.be.true();
        expect(queryStub.calledOnce).to.be.true();
        expect(userCount).to.equals(fakeUserCount);
    });

    it('counts the number of records with subquery and search criteria', async () => {
        // setup
        const fakeUserCount = 5;
        const fakeCriteria = { search: 'fakesearch' };
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];

        const firstStub = Sinon.stub().resolves(fakeUserCount);
        const asStub = Sinon.stub()
            .withArgs(Sinon.match.string)
            .returns();
        const fromStub = Sinon.stub().returns({ first: firstStub });
        const countStub = Sinon.stub().returns({ from: fromStub, first: firstStub });
        const searchStub = Sinon.stub()
            .withArgs(fakeCriteria.search)
            .returns({ as: asStub });
        queryStub = Sinon.stub(Model, 'query')
            .onCall(0)
            .returns({ count: countStub });
        queryStub.onCall(1).returns({ search: searchStub });

        const fakeQuery = { as: asStub, search: searchStub };

        // exercise
        const userCount = await userRepository.count(fakeCriteria, fakeQuery);

        // exercise and validate
        expect(firstStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(fromStub.calledOnce).to.be.true();
        expect(asStub.calledOnce).to.be.true();
        expect(queryStub.calledOnce).to.be.true();
        expect(userCount).to.equals(fakeUserCount);
    });

    it('creates a query for a model', async () => {
        // setup
        const options = { models: ['user'] };
        const server = Hapi.server();
        server.register(Logger);
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        const fakeQuery = 'a fake query stub';
        queryStub = Sinon.stub(Model, 'query').returns(fakeQuery);

        // exercise
        const modelQuery = await userRepository.query();

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(modelQuery).to.equals(fakeQuery);
    });

    it('handles error creating a query for a model', async () => {
        // setup
        const error = 'error';
        const options = { models: ['user'] };
        const server = Hapi.server();
        server.register(Logger);
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['User'];
        queryStub = Sinon.stub(Model, 'query').rejects(new Error(error));

        // exercise and validate
        await expect(userRepository.query()).to.reject(Error, error);
    });

    it('binds repositories to a new transaction', async () => {
        // setup
        const options = { models: ['user', 'role'] };
        const server = Hapi.server();
        server.register(Logger);
        await server.register({ plugin: Repository, options });
        txStub = Sinon.stub(Objection, 'transaction');
        txStub
            .withArgs(UserModel, RoleModel, Sinon.match.func)
            .callsFake((userModel, roleModel, cb) => {
                return cb(userModel, roleModel);
            });

        // exercise
        const done = await Repository.tx([UserModel, RoleModel], (userTxRepo, roleTxRepo) => {
            // validate
            expect(userTxRepo.model).to.equals(Repository['User'].model);
            expect(roleTxRepo.model).to.equals(Repository['Role'].model);

            return true;
        });

        // validate
        expect(done).to.equals(true);
    });

    it('binds repositories to an existing transaction', async () => {
        // setup
        const options = { models: ['user', 'role'] };
        const server = Hapi.server();
        server.register(Logger);
        await server.register({ plugin: Repository, options });
        const fakeTx = { commit: () => {} };

        // exercise
        const done = await Repository.tx(
            [UserModel, RoleModel],
            (userTxRepo, roleTxRepo) => {
                // validate
                expect(userTxRepo.model.knex()).to.equal(fakeTx);
                expect(roleTxRepo.model.knex()).to.equal(fakeTx);
                return true;
            },
            fakeTx
        );

        // validate
        expect(done).to.equals(true);
    });

    it('handles errors obtaining transaction repositories from models', async () => {
        // setup
        const error = 'error';
        const options = { models: ['user', 'role'] };
        const server = Hapi.server();
        server.register(Logger);
        await server.register({ plugin: Repository, options });
        txStub = Sinon.stub(Objection, 'transaction');
        txStub.throws(new Error(error));

        // exercise
        await expect(Repository.tx([UserModel, RoleModel], () => {})).to.reject(Error, error);
    });

    it('opens a new transaction for work', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Objection.transaction.start.restore();
        };

        // setup
        const fakeResult = 'work done';
        const fakeCommit = Sinon.stub().resolves();
        const fakeTx = { commit: fakeCommit };
        const fakeWork = Sinon.stub()
            .withArgs(fakeTx)
            .resolves(fakeResult);
        Sinon.stub(Objection.transaction, 'start').returns(fakeTx);

        // exercise
        const result = await Repository.doTx(fakeWork);

        // verify
        expect(fakeWork.calledOnce).to.be.true();
        expect(fakeCommit.calledOnce).to.be.true();
        expect(result).to.equals(fakeResult);
    });

    it('performs rollback if work works', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Objection.transaction.start.restore();
        };

        // setup
        const fakeError = 'error doing work';
        const fakeRollback = Sinon.stub().resolves();
        const fakeTx = { rollback: fakeRollback };
        const fakeWork = Sinon.stub()
            .withArgs(fakeTx)
            .rejects(Error(fakeError));
        Sinon.stub(Objection.transaction, 'start').returns(fakeTx);

        // exercise and verify
        await expect(Repository.doTx(fakeWork)).to.rejects(Error, fakeError);
        expect(fakeRollback.calledOnce).to.equal(true);
    });
});
