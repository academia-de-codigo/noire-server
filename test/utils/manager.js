const Lab = require('@hapi/lab');
const Exiting = require('exiting');
const Manager = require('utils/manager');
const Config = require('config');
const ConfigValidation = require('utils/config-validation');
const Sinon = require('sinon');

const { after, before, beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Manager', () => {
    before(() => {
        // Silence log messages
        Exiting.log = function() {};
    });

    beforeEach(() => {
        Manager.reset();
    });

    after(() => {
        Manager.reset();
    });

    it('validates configuration', async flags => {
        // cleanup
        flags.onCleanup = function() {
            validateSpy.restore();
        };

        // setup
        const validateSpy = Sinon.spy(ConfigValidation, 'validate');

        // exercise
        await Manager.start();

        // validation
        expect(validateSpy.calledOnce).to.be.true();
    });

    it('returns server object', async () => {
        // exercise
        const server = await Manager.start();

        // verify
        expect(server.info).to.be.an.object();
        expect(server.info.port).to.be.a.number();
        expect(server.settings.app.name).to.equals('api');
    });

    it('starts server on specified port', async flags => {
        flags.onCleanup = async function() {
            Config.api.port = origPort;
        };

        // setup
        const origPort = Config.api.port;
        Config.api.port = 8888;

        // exercise
        const server = await Manager.start();

        // verify
        expect(server.info).to.be.an.object();
        expect(server.info.port).to.equal(8888);
    });

    it('stops a started server', async () => {
        // setup
        let called = false;
        const preStop = function() {
            called = true;
        };

        // exercise
        const server = await Manager.start();
        server.events.on('stop', preStop);
        await Manager.stop();

        // verify
        expect(called).to.be.true();
    });

    it('returns proper server state', async () => {
        // exercise
        let initialState = Manager.getState();
        await Manager.start();
        let startedState = Manager.getState();
        await Manager.stop();
        let stoppedState = Manager.getState();

        // verify
        expect(initialState).to.equals('stopped');
        expect(startedState).to.equals('started');
        expect(stoppedState).to.equals('stopped');
    });

    it('registers plugins', async () => {
        // setup
        let registerCount = 0;
        const register = function() {
            registerCount++;
        };
        const plugins = [{ name: 'p1', pkg: {}, register }, { name: 'p2', pkg: {}, register }];

        // exercise
        await Manager.start(plugins);

        // verify
        expect(registerCount).to.equal(2);
    });

    it('handles plugin registration failures', async () => {
        // setup
        const PLUGIN_ERROR = 'plugin error';
        const fakePlugin = {
            register: async function() {
                throw new Error(PLUGIN_ERROR);
            },
            name: 'fakePlugin',
            pkg: {}
        };

        // exercise and validate
        await expect(Manager.start([fakePlugin])).to.reject(PLUGIN_ERROR);
    });
});
