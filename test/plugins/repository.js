const Path = require('path');
const Hapi = require('hapi');
const Lab = require('lab');
const Sinon = require('sinon');
const Objection = require('objection');
const Repository = require(Path.join(process.cwd(), 'lib/plugins/repository'));
const UserModel = require(Path.join(process.cwd(), 'lib/models/user'));
const RoleModel = require(Path.join(process.cwd(), 'lib/models/role'));

const Model = Objection.Model;
const { afterEach, beforeEach, describe, expect, it } = exports.lab = Lab.script();

describe('Plugin: repository', () => {

    let server;
    let queryStub;
    let txStub;

    beforeEach(() => {
        server = Hapi.server();
    });

    afterEach(() => {

        delete Repository.user;
        delete Repository.role;

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
        expect(Repository['user']).to.be.an.instanceof(Repository.ModelRepository);
        expect(Repository['user'].model).to.equals(UserModel);
        expect(Repository['role']).to.be.an.instanceof(Repository.ModelRepository);
        expect(Repository['role'].model).to.equals(RoleModel);
    });

    it('creates a repository object for a specific model', async () => {

        // exercise
        await server.register(Repository);
        const repository = Repository.create('user');

        // validate
        expect(repository).to.be.an.instanceof(Repository.ModelRepository);
        expect(Repository['user']).to.be.an.instanceof(Repository.ModelRepository);
        expect(repository).to.equals(Repository['user']);
        expect(repository.model).to.equals(UserModel);
    });

    it('handles error when creating a repository for invalid model', async () => {

        // exercise
        await server.register(Repository);

        // validate
        // code requires a function as argument to assert exception
        expect(() => Repository.create('invalid')).to.throw();
    });

    it('logs repository creation', async () => {

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

    it('decorates server with repositories', async () => {

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

    it('returns a specific record', async () => {

        // setup
        const fakeUser = {
            id: 1
        };
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const findByIdStub = Sinon.stub().withArgs(fakeUser.id).resolves(fakeUser);
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
        const userRepository = Repository['user'];
        const findByIdStub = Sinon.stub().rejects(new Error(error));
        queryStub = Sinon.stub(Model, 'query').returns({ findById: findByIdStub });

        // exercise and validate
        expect(userRepository.findOne(1)).to.reject(Error, error);
    });

    it('returns all records within limit', async () => {

        // setup
        const fakeUsers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const limitStub = Sinon.stub();
        const offsetStub = Sinon.stub();
        const orderByStub = Sinon.stub();
        const searchStub = Sinon.stub();
        limitStub.withArgs(UserModel.LIMIT_DEFAULT).returns({ offset: offsetStub });
        offsetStub.withArgs(Sinon.match.number).returns({ orderBy: orderByStub });
        orderByStub.withArgs(Sinon.match.string, Sinon.match.string).returns({ search: searchStub });
        searchStub.resolves(fakeUsers);
        queryStub = Sinon.stub(Model, 'query').returns({ limit: limitStub });
        limitStub.throws(new Error('wrong limit criteria'));
        offsetStub.throws(new Error('wrong offset criteria'));
        orderByStub.throws(new Error('wrong orderby criteria'));

        // exercise
        const user = await userRepository.findAll();

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(limitStub.calledOnce).to.be.true();
        expect(offsetStub.calledOnce).to.be.true();
        expect(orderByStub.calledOnce).to.be.true();
        expect(user).to.equals(fakeUsers);
    });

    it('returns records within limit with a criteria object', async () => {

        // setup
        const fakeUsers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const fakeCriteria = { limit: 2, page: 2, sort: 'field', descending: 'desc', search: 'fakesearch' };
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const limitStub = Sinon.stub();
        const offsetStub = Sinon.stub();
        const orderByStub = Sinon.stub();
        const searchStub = Sinon.stub();
        limitStub.withArgs(fakeCriteria.limit).returns({ offset: offsetStub });
        offsetStub.withArgs(Sinon.match.number).returns({ orderBy: orderByStub });
        orderByStub.withArgs(fakeCriteria.sort, fakeCriteria.descending).returns({ search: searchStub });
        searchStub.withArgs(fakeCriteria.search).resolves(fakeUsers);
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
        expect(orderByStub.calledOnce).to.be.true();
        expect(searchStub.calledOnce).to.be.true();
        expect(user).to.equals(fakeUsers);
    });

    it('returns records within limit with a number as criteria', async () => {

        // setup
        const fakeUsers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const fakeCriteria = 2;
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const limitStub = Sinon.stub();
        const offsetStub = Sinon.stub();
        const orderByStub = Sinon.stub();
        const searchStub = Sinon.stub();
        limitStub.withArgs(fakeCriteria).returns({ offset: offsetStub });
        offsetStub.withArgs(Sinon.match.number).returns({ orderBy: orderByStub });
        orderByStub.withArgs('', Sinon.match.string).returns({ search: searchStub });
        searchStub.withArgs().resolves(fakeUsers);
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
        expect(orderByStub.calledOnce).to.be.true();
        expect(searchStub.calledOnce).to.be.true();
        expect(user).to.equals(fakeUsers);
    });

    it('returns records ordered by a column with a string as criteria', async () => {

        // setup
        const fakeUsers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const fakeCriteria = 'column';
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const limitStub = Sinon.stub();
        const offsetStub = Sinon.stub();
        const orderByStub = Sinon.stub();
        const searchStub = Sinon.stub();
        limitStub.withArgs(UserModel.LIMIT_DEFAULT).returns({ offset: offsetStub });
        offsetStub.withArgs(Sinon.match.number).returns({ orderBy: orderByStub });
        orderByStub.withArgs(fakeCriteria, Sinon.match.string).returns({ search: searchStub });
        searchStub.withArgs().resolves(fakeUsers);
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
        expect(orderByStub.calledOnce).to.be.true();
        expect(searchStub.calledOnce).to.be.true();
        expect(user).to.equals(fakeUsers);
    });

    it('handles error when querying for all records', async () => {

        // setup
        const error = 'error';
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const searchStub = Sinon.stub().rejects(new Error(error));
        const orderByStub = Sinon.stub().returns({ search: searchStub });
        const offsetStub = Sinon.stub().returns({ orderBy: orderByStub });
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
        const userRepository = Repository['user'];
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
        const userRepository = Repository['user'];
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
        const userRepository = Repository['user'];
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
        const userRepository = Repository['user'];
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
        const userRepository = Repository['user'];
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
        const userRepository = Repository['user'];
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
        const userRepository = Repository['user'];
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
        const fakeCriteria = { search: 'fakesearch' };
        const options = { models: ['user'] };
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];

        const firstStub = Sinon.stub().resolves(fakeUserCount);
        const asStub = Sinon.stub().withArgs(Sinon.match.string).returns();
        const fromStub = Sinon.stub();
        const countStub = Sinon.stub().returns({ from: fromStub, first: firstStub });
        const searchStub = Sinon.stub().withArgs(fakeCriteria.search).returns({ as: asStub });
        queryStub = Sinon.stub(Model, 'query').onCall(0).returns({ count: countStub });
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


    it('creates a query for a model', async () => {
        // setup
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
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
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        queryStub = Sinon.stub(Model, 'query').rejects(new Error(error));

        // exercise and validate
        await expect(userRepository.query()).to.reject(Error, error);
    });

    it('obtains transaction repositories from models', async () => {

        // setup
        const options = { models: ['user', 'role'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        txStub = Sinon.stub(Objection, 'transaction');
        txStub.withArgs(UserModel, RoleModel, Sinon.match.func).callsFake((userModel, roleModel, cb) => {
            cb(userModel, roleModel);
        }).resolves();

        // exercise
        Repository.tx(UserModel, RoleModel, (userTxRepo, roleTxRepo) => {

            // validate
            expect(userTxRepo.model).to.equals(Repository['user'].model);
            expect(roleTxRepo.model).to.equals(Repository['role'].model);
        });
    });

    it('handles errors obtaining transaction repositories from models', async () => {

        // setup
        const error = 'error';
        const options = { models: ['user', 'role'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        txStub = Sinon.stub(Objection, 'transaction');
        txStub.throws(new Error(error));

        // exercise
        await expect(Repository.tx(UserModel, RoleModel, () => { })).to.reject(Error, error);
    });
});
