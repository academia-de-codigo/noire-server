const Path = require('path');
const Lab = require('lab');
const Exiting = require('exiting');
const Manager = require('../../lib/utils/manager');

const { before, beforeEach, describe, expect, it } = exports.lab = Lab.script();

const internals = {};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Manager', () => {

    before(() => {

        // Silence log messages
        Exiting.log = function() { };
    });

    beforeEach(() => {

        Manager.reset();
    });

    it('returns server object', async () => {

        // exercise
        const server = await Manager.start({}, internals.composeOptions);

        // verify
        expect(server.info).to.be.an.object();
        expect(server.info.port).to.be.a.number();
    });

    it('starts server on specified port', async () => {

        // setup
        var manifest = {
            server: {
                port: 8080
            }
        };

        // exercise
        const server = await Manager.start(manifest, internals.composeOptions);

        // verify
        expect(server.info).to.be.an.object();
        expect(server.info.port).to.equal(8080);
    });

    it('stops a started server', async () => {

        // setup
        let called = false;
        const preStop = function() {
            called = true;
        };

        // exercise
        const server = await Manager.start({}, internals.composeOptions);
        server.events.on('stop', preStop);
        await Manager.stop();

        // verify
        expect(called).to.be.true();
    });

    it('returns proper server state', async () => {

        // exercise
        let initialState = Manager.getState();
        await Manager.start({}, internals.composeOptions);
        let startedState = Manager.getState();
        await Manager.stop();
        let stoppedState = Manager.getState();

        // verify
        expect(initialState).to.equals('stopped');
        expect(startedState).to.equals('started');
        expect(stoppedState).to.equals('stopped');
    });
});
