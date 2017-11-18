const Path = require('path');
const Lab = require('lab');
const Exiting = require('exiting');
const Manager = require(Path.join(process.cwd(), 'lib/utils/manager'));

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

    it('returns servers object for single server', async () => {

        // setup
        const server = 'server';
        const manifest = { server: { app: { name: server } } };

        // exercise
        const servers = await Manager.start(manifest, internals.composeOptions);

        // verify
        expect(servers[server].info).to.be.an.object();
        expect(servers[server].info.port).to.be.a.number();
        expect(servers[server].settings.app.name).to.equals(manifest.server.app.name);
    });

    it('returns servers object for multiple servers', async () => {

        // setup
        const server1 = 'server1';
        const server2 = 'server2';
        const manifests = [
            { server: { app: { name: server1 } } },
            { server: { app: { name: server2 } } }
        ];

        // exercise
        const servers = await Manager.start(manifests, internals.composeOptions);

        // verify
        expect(servers[server1].info).to.be.an.object();
        expect(servers[server1].info.port).to.be.a.number();
        expect(servers[server1].settings.app.name).to.equals(manifests[0].server.app.name);
        expect(servers[server2].info).to.be.an.object();
        expect(servers[server2].info.port).to.be.a.number();
        expect(servers[server2].settings.app.name).to.equals(manifests[1].server.app.name);
    });

    it('starts servers on specified ports', async () => {

        // setup
        const server1 = 'server1';
        const server2 = 'server2';
        const manifests = [
            { server: { port: 8888, app: { name: server1 } } },
            { server: { port: 8889, app: { name: server2 } } }
        ];

        // exercise
        const servers = await Manager.start(manifests, internals.composeOptions);

        // verify
        expect(servers[server1].info).to.be.an.object();
        expect(servers[server1].info.port).to.equal(8888);
        expect(servers[server2].info).to.be.an.object();
        expect(servers[server2].info.port).to.equal(8889);
    });

    it('stops a started server', async () => {

        // setup
        const server = 'server';
        const manifests = [
            { server: { app: { name: server } } },
            { server: { app: { name: 'another server' } } }
        ];
        let called = false;
        const preStop = function() {
            called = true;
        };

        // exercise
        const servers = await Manager.start(manifests, internals.composeOptions);
        servers[server].events.on('stop', preStop);
        await Manager.stop();

        // verify
        expect(called).to.be.true();
    });

    it('returns proper server state', async () => {

        // setup
        const manifest = { server: { app: { name: 'server' } } };

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
        const manifests = [{
            server: {
                app: {
                    name: 'server1'
                }
            },
            register: {
                plugins: [{
                    plugin: fakePlugin
                }]
            }
        }];
        manifests.push({ server: { app: { name: 'server2' } } });

        // exercise and validate
        await expect(Manager.start(manifests, internals.composeOptions)).to.reject(PLUGIN_ERROR);
    });
});
