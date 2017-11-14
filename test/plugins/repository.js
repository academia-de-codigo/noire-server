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
    let txStub;

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

    it('should handle error when creating a repository for invalid model', async () => {

        // setup
        const server = Hapi.server();

        // exercise
        await server.register(Repository);

        // validate
        // code requires a function as argument to assert exception
        expect(() => Repository.create('invalid')).to.throw();
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

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(findByIdStub.findById.calledOnce).to.be.true();
        expect(user).to.equals(fakeUser);
    });

    it('handles error when querying for specific record', async () => {

        // setup
        const error = 'error';
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        queryStub = Sinon.stub(Model, 'query').throws(new Error(error));

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
        expect(limitStub.limit.calledOnce).to.be.true();
        expect(offsetStub.offset.calledOnce).to.be.true();
        expect(orderByStub.orderBy.calledOnce).to.be.true();
        expect(user).to.equals(fakeUsers);
    });

    it('should return records within limit with a criteria object', async () => {

        // setup
        const fakeUsers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const fakeCriteria = {
            limit: 2,
            page: 2,
            sort: 'field',
            descending: 'desc'
        };
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const limitStub = { limit: Sinon.stub() };
        const offsetStub = { offset: Sinon.stub() };
        const orderByStub = { orderBy: Sinon.stub() };
        limitStub.limit.withArgs(fakeCriteria.limit).returns(offsetStub);
        limitStub.limit.throws(new Error('wrong limit criteria'));
        offsetStub.offset.withArgs(Sinon.match.number).returns(orderByStub);
        offsetStub.offset.throws(new Error('wrong offset criteria'));
        orderByStub.orderBy.withArgs(fakeCriteria.sort, fakeCriteria.descending).resolves(fakeUsers);
        orderByStub.orderBy.throws(new Error('wrong orderby criteria'));
        queryStub = Sinon.stub(Model, 'query').returns(limitStub);

        // exercise
        const user = await userRepository.findAll(fakeCriteria);

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(limitStub.limit.calledOnce).to.be.true();
        expect(offsetStub.offset.calledOnce).to.be.true();
        expect(orderByStub.orderBy.calledOnce).to.be.true();
        expect(user).to.equals(fakeUsers);

    });

    it('should return records within limit with a number as criteria', async () => {

        // setup
        const fakeUsers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const fakeCriteria = 2;
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const limitStub = { limit: Sinon.stub() };
        const offsetStub = { offset: Sinon.stub() };
        const orderByStub = { orderBy: Sinon.stub() };
        limitStub.limit.withArgs(fakeCriteria).returns(offsetStub);
        limitStub.limit.throws(new Error('wrong limit criteria'));
        offsetStub.offset.withArgs(Sinon.match.number).returns(orderByStub);
        offsetStub.offset.throws(new Error('wrong offset criteria'));
        orderByStub.orderBy.withArgs(Sinon.match.string, Sinon.match.string).resolves(fakeUsers);
        orderByStub.orderBy.throws(new Error('wrong orderby criteria'));
        queryStub = Sinon.stub(Model, 'query').returns(limitStub);

        // exercise
        const user = await userRepository.findAll(fakeCriteria);

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(limitStub.limit.calledOnce).to.be.true();
        expect(offsetStub.offset.calledOnce).to.be.true();
        expect(orderByStub.orderBy.calledOnce).to.be.true();
        expect(user).to.equals(fakeUsers);
    });

    it('should return records ordered by a column with a string as criteria', async () => {

        // setup
        const fakeUsers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const fakeCriteria = 'column';
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
        orderByStub.orderBy.withArgs(fakeCriteria, Sinon.match.string).resolves(fakeUsers);
        orderByStub.orderBy.throws(new Error('wrong orderby criteria'));
        queryStub = Sinon.stub(Model, 'query').returns(limitStub);

        // exercise
        const user = await userRepository.findAll(fakeCriteria);

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(limitStub.limit.calledOnce).to.be.true();
        expect(offsetStub.offset.calledOnce).to.be.true();
        expect(orderByStub.orderBy.calledOnce).to.be.true();
        expect(user).to.equals(fakeUsers);
    });

    it('handles error when querying for all records', async () => {

        // setup
        const error = 'error';
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        queryStub = Sinon.stub(Model, 'query').throws(new Error(error));

        // exercise and validate
        await expect(userRepository.findAll()).to.reject(Error, error);
    });

    it('should insert a new record', async () => {

        // setup
        const fakeUser = 'a fake user';
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const insertStub = {
            insert: Sinon.stub()
        };
        insertStub.insert.withArgs(fakeUser).resolves();
        insertStub.insert.rejects(new Error('invalid insert query'));
        queryStub = Sinon.stub(Model, 'query').returns(insertStub);

        // exercise
        await userRepository.add(fakeUser);

        // validate
        expect(queryStub.calledOnce).to.be.true();
    });

    it('handles error inserting new record', async () => {

        // setup
        const error = 'error';
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        queryStub = Sinon.stub(Model, 'query').throws(new Error(error));

        // exercise and validate
        await expect(userRepository.add('user')).to.reject(Error, error);
    });

    it('should update an existing record', async () => {

        // setup
        const fakeUser = { $query: Sinon.stub() };
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const updateStub = {
            updateAndFetch: Sinon.stub()
        };
        fakeUser.$query.returns(updateStub);
        updateStub.updateAndFetch.resolves();

        // exercise
        await userRepository.update(fakeUser);

        // validate
        expect(fakeUser.$query.calledOnce).to.be.true();
        expect(updateStub.updateAndFetch.calledOnce).to.be.true();
    });

    it('handles error updating an exiting record', async () => {

        // setup
        const fakeUser = { $query: Sinon.stub() };
        const error = 'error';
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        fakeUser.$query.throws(new Error(error));

        // exercise and validate
        await expect(userRepository.update(fakeUser)).to.reject(Error, error);
    });

    it('should remove an existing record', async () => {
        // setup
        const fakeId = 1;
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        const deleteByIdStub = {
            deleteById: Sinon.stub()
        };
        queryStub = Sinon.stub(Model, 'query').returns(deleteByIdStub);
        deleteByIdStub.deleteById.withArgs(fakeId).resolves();
        deleteByIdStub.deleteById.rejects(new Error('invalid query'));

        // exercise
        await userRepository.remove(fakeId);

        // validate
        expect(queryStub.calledOnce).to.be.true();
        expect(deleteByIdStub.deleteById.calledOnce).to.be.true();
    });

    it('handles error removing an exiting record', async () => {

        // setup
        const error = 'error';
        const options = { models: ['user'] };
        const server = Hapi.server();
        await server.register({ plugin: Repository, options });
        const userRepository = Repository['user'];
        queryStub = Sinon.stub(Model, 'query').throws(new Error(error));

        // exercise and validate
        await expect(userRepository.remove(1)).to.reject(Error, error);
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
        queryStub = Sinon.stub(Model, 'query').throws(new Error(error));

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
        await expect(Repository.tx(UserModel, RoleModel, ()=> {})).to.reject(Error, error);
    });
});
