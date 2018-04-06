const Hapi = require('hapi');
const Lab = require('lab');
const Sinon = require('sinon');
const mock = require('mock-require');
const Config = require('config');
const KnexConfig = require('knexfile');
const Logger = require('test/fixtures/logger-plugin');

const { afterEach, beforeEach, describe, expect, it } = (exports.lab = Lab.script());

const internals = {};

describe('Plugin: db', () => {
    let configStub;
    let knexConfigStub;
    let rawQueryStub;
    let knexStub;

    beforeEach(() => {
        configStub = Sinon.stub(Config, 'environment').value('testing');
        knexConfigStub = Sinon.stub(KnexConfig, 'testing').value(internals.knexConfig);
        rawQueryStub = Sinon.stub().resolves([{ result: 2 }]);
        knexStub = Sinon.stub().returns({ raw: rawQueryStub });
    });

    afterEach(() => {
        configStub.restore();
        knexConfigStub.restore();
        mock.stopAll();
    });

    it('initializes the knex db library', async () => {
        // setup
        mock('knex', knexStub);
        const Database = mock.reRequire('plugins/db');
        const server = Hapi.server();
        server.register(Logger);

        // exercise
        await server.register(Database);

        // verify
        expect(knexStub.called).to.be.true();
        expect(knexStub.getCall(0).args[0]).to.equals(internals.knexConfig);
        expect(rawQueryStub.getCall(0).args[0]).to.startsWith('select');
    });

    it('handles db connection error', async () => {
        // setup
        const error = 'fakeError';
        rawQueryStub = Sinon.stub().rejects(new Error(error));
        knexStub = Sinon.stub().returns({ raw: rawQueryStub });
        mock('knex', knexStub);
        const Database = mock.reRequire('plugins/db');
        const server = Hapi.server();
        server.register(Logger);

        // exercise and verify
        await expect(server.register(Database)).to.reject(Error, error);
    });

    it('handles missing connection', async () => {
        // setup
        knexConfigStub.restore(); // stubbing twice breaks restore
        knexConfigStub = Sinon.stub(KnexConfig, 'testing').value({});
        mock('knex', Sinon.stub());
        const Database = mock.reRequire('plugins/db');
        const server = Hapi.server();
        server.register(Logger);

        // exercise and verify
        await expect(server.register(Database)).to.reject(Error, 'no connection configured');
    });

    it('handles missing database name', async () => {
        // setup
        knexConfigStub.restore(); // stubbing twice breaks restore
        knexConfigStub = Sinon.stub(KnexConfig, 'testing').value(internals.knexConfigMissingDb);
        mock('knex', knexStub);
        const Database = mock.reRequire('plugins/db');
        const server = Hapi.server();
        server.register(Logger);

        // exercise and verify
        await expect(server.register(Database)).to.reject(Error, 'no database configured');
    });

    it('does not require database name for sqlite', async () => {
        // setup

        knexConfigStub.restore(); // stubbing twice breaks restore
        knexConfigStub = Sinon.stub(KnexConfig, 'testing').value(internals.knexConfigSqlite);
        mock('knex', knexStub);
        const Database = mock.reRequire('plugins/db');
        const server = Hapi.server();
        server.register(Logger);

        // exercise
        await server.register(Database);

        // verify
        expect(knexStub.called).to.be.true();
        expect(knexStub.getCall(0).args[0]).to.equals(internals.knexConfigSqlite);
    });

    it('handles db connection test unexpected result', async () => {
        // setup
        rawQueryStub = Sinon.stub().resolves([{ result: 0 }]);
        knexStub = Sinon.stub().returns({ raw: rawQueryStub });
        mock('knex', knexStub);
        const Database = mock.reRequire('plugins/db');
        const server = Hapi.server();
        server.register(Logger);

        // exercise
        await expect(server.register(Database)).to.reject(
            Error,
            'database connection test returned wrong result'
        );
    });

    it('decorates the server with knex and objection', async () => {
        // setup
        mock('knex', knexStub);
        const Database = mock.reRequire('plugins/db');
        const decorateSpy = Sinon.spy();
        const mockServer = {
            logger: () => Logger.fake,
            decorate: decorateSpy,
            ext: function() {}
        };

        // exercise
        await Database.plugin.register(mockServer);

        //verify
        expect(decorateSpy.called).to.be.true();
        expect(decorateSpy.getCall(0).args[0]).to.equals('server');
        expect(decorateSpy.getCall(0).args[1]).to.equals('db');
        expect(decorateSpy.getCall(0).args[2]).to.be.an.object();
        expect(decorateSpy.getCall(0).args[2].query).to.exist();
        expect(decorateSpy.getCall(0).args[2].model).to.exist();
    });

    it('destroys knex after server stop', async () => {
        // setup
        const destroyStub = Sinon.stub();
        knexStub = Sinon.stub().returns({ raw: rawQueryStub, destroy: destroyStub });
        mock('knex', knexStub);
        const Database = mock.reRequire('plugins/db');
        const mockServer = {
            logger: () => Logger.fake,
            decorate: function() {},
            ext: function(hook, cb) {
                if (hook !== 'onPostStop') {
                    return;
                }

                cb();
            }
        };

        // exercise
        await Database.plugin.register(mockServer);

        //verify
        expect(destroyStub.called).to.be.true();
    });
});

internals.knexConfig = {
    client: 'mock',
    connection: {
        database: 'mock'
    }
};

internals.knexConfigMissingDb = {
    client: 'mock',
    connection: {}
};

internals.knexConfigSqlite = {
    client: 'sqlite',
    connection: {}
};
