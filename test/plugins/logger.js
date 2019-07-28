const Lab = require('@hapi/lab');
const Hapi = require('@hapi/hapi');
const Sinon = require('sinon');
const Pino = require('hapi-pino');
const Logger = require('plugins/logger');
const FakeLogger = require('test/fixtures/logger-plugin');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Plugin: logger', () => {
    let server;

    beforeEach(() => {
        server = Hapi.server({ app: { name: 'test' } });
    });

    it('registers the hapi-pino plugin', async () => {
        // exercise
        await server.register(Logger);

        // validate
        expect(server.registrations['hapi-pino']).to.be.an.object();
        expect(server.decorations.server).to.contains('logger');
    });

    it('handles hapi-pino plugin registration failures', async flags => {
        // cleanup
        const pinoRegister = Pino.register;
        flags.onCleanup = function() {
            Pino.register = pinoRegister;
        };

        // setup
        const PLUGIN_ERROR = 'plugin error';
        Pino.register = function() {
            throw new Error(PLUGIN_ERROR);
        };

        // exercise and validate
        await expect(server.register(Logger)).to.reject(PLUGIN_ERROR);
    });

    it('registers route event handler', async () => {
        // exercise
        await server.register(Logger);
        // server.route({ path: '/', method: '*', handler: () => {} });

        // validate
        expect(server.events.hasListeners('route')).to.be.true();
    });

    it('logs new server routes', async flags => {
        // cleanup
        flags.onCleanup = function() {
            FakeLogger.fake.child.restore();
            FakeLogger.fake.debug.restore();
        };

        // setup
        Sinon.spy(FakeLogger.fake, 'debug');
        Sinon.spy(FakeLogger.fake, 'child');
        const fakeMethod = '*';
        const fakePath = '/';
        await server.register(Logger);
        server.decorate('server', 'logger', () => () => FakeLogger.fake, {
            extend: true
        });

        // exercise
        server.route({ path: fakePath, method: fakeMethod, handler: () => {} });

        // validate
        expect(server.events.hasListeners('route')).to.be.true();
        expect(
            FakeLogger.fake.child.calledWith({ method: fakeMethod, path: fakePath })
        ).to.be.true();
        expect(FakeLogger.fake.debug.calledWith('route')).to.be.true();
    });

    it('returns a new logger instance', () => {
        expect(Logger.getLogger().LOG_VERSION).to.be.a.number();
    });
});
