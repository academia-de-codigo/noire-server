const Lab = require('lab'); // the test framework
const Hapi = require('hapi');
const Path = require('path');
const Vision = require('vision');
const Inert = require('inert');
const Lout = require('lout');
const Docs = require(Path.join(process.cwd(), 'lib/plugins/docs'));
const Logger = require(Path.join(process.cwd(), 'test/fixtures/logger-plugin'));

const { describe, expect, it } = exports.lab = Lab.script();

describe('Plugin: docs', () => {

    it('handles vision plugin registration failures', async (flags) => {

        // cleanup
        const visionRegister = Vision.plugin.register;
        flags.onCleanup = function() {
            Vision.plugin.register = visionRegister;
        };

        // setup
        const PLUGIN_ERROR = 'plugin error';
        Vision.plugin.register = async function() {
            throw new Error(PLUGIN_ERROR);
        };
        const server = Hapi.server();

        // exercise and validate
        await expect(server.register(Docs)).to.reject(PLUGIN_ERROR);
    });

    it('handles inert plugin registration failures', async (flags) => {

        // cleanup
        const inertRegister = Inert.plugin.register;
        flags.onCleanup = function() {
            Inert.plugin.register = inertRegister;
        };

        // setup
        const PLUGIN_ERROR = 'plugin error';
        Inert.plugin.register = async function() {
            throw new Error(PLUGIN_ERROR);
        };
        const server = Hapi.server();

        // exercise and validate
        await expect(server.register(Docs)).to.reject(PLUGIN_ERROR);
    });

    it('handles inert plugin registration failures', async (flags) => {

        // cleanup
        const loutRegister = Lout.plugin.register;
        flags.onCleanup = function() {
            Lout.plugin.register = loutRegister;
        };

        // setup
        const PLUGIN_ERROR = 'plugin error';
        Lout.plugin.register = async function() {
            throw new Error(PLUGIN_ERROR);
        };
        const server = Hapi.server();

        // exercise and validate
        await expect(server.register(Docs)).to.reject(PLUGIN_ERROR);
    });

    it('returns the docs view', async () => {

        // setup
        const server = Hapi.server();
        server.register(Logger);
        await server.register(Docs);
        await server.initialize();
        server.route({ method: 'GET', path: '/', handler: () => { } });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/docs'
        });

        // validate
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.payload).to.be.a.string();
    });
});
