const Lab = require('lab');
const Hapi = require('hapi');
const Path = require('path');
const Pino = require('hapi-pino');
const Logger = require(Path.join(process.cwd(), 'lib/plugins/logger'));


const { beforeEach, describe, expect, it } = exports.lab = Lab.script();

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

    it('handles hapi-pino plugin registration failures', async (flags) => {

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

        // validate
        expect(server.events.hasListeners('route')).to.be.true();
    });

});
