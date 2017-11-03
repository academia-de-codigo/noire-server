const Path = require('path');
const Hapi = require('hapi');
const Lab = require('lab');
const Manager = require('../../lib/utils/manager');

const { beforeEach, describe, expect, it } = exports.lab = Lab.script();

const internals = {};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../lib')
};

describe('Manager', () => {

    beforeEach(() => {

        Manager.reset();
    });

    it('returns server object', async () => {

        // setup
        var manifest = {
            connections: [{
                port: 0
            }]
        };

        // exercise
        const server = await Manager.start(manifest, internals.composeOptions);

        // verify
        expect(server).to.be.instanceof(Hapi.Server);
    });

    it('starts server on specified port', async () => {

        // setup
        var manifest = {
            connections: [{
                port: 8080
            }]
        };

        // exercise
        const server = await Manager.start(manifest, internals.composeOptions);

        // verify
        expect(server.info.port).to.equal(8080);
    });

    it('stops a started server', async () => {

        // setup
        var manifest = {
            connections: [{
                port: 0
            }]
        };

        let called = false;
        const preStop = function() {
            called = true;
        };

        // exercise
        const server = await Manager.start(manifest, internals.composeOptions);
        server.on('stop', preStop);
        await Manager.stop();

        // verify
        expect(called).to.be.true();
    });

    it('returns proper server state', async () => {

        // setup
        var manifest = {
            connections: [{
                port: 0
            }]
        };

        // exercise
        let initialState = Manager.getState();
        await Manager.start(manifest, internals.composeOptions);
        let startedState = Manager.getState();
        await Manager.stop();
        let stoppedState = Manager.getState();

        // verify
        expect(initialState).to.equals('stopped');
        expect(startedState).to.equals('started');
        expect(stoppedState).to.equals('stopped');
    });
});
