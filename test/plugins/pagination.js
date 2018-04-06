const Lab = require('lab');
const Hapi = require('hapi');
const Pagination = require('plugins/pagination');
const Logger = require('test/fixtures/logger-plugin');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Plugin: pagination', () => {
    let server;

    beforeEach(async () => {
        server = Hapi.server();
        server.register(Logger);
    });

    it('registers the hapi-pagination plugin', async () => {
        // exercise
        await server.register(Pagination);

        // validate
        expect(server.decorations.toolkit).to.contains('paginate');
    });

    it('handles hapi-pagination plugin registration failures', async flags => {
        // cleanup
        const paginationRegister = Pagination.plugin.register;
        flags.onCleanup = function() {
            Pagination.plugin.register = paginationRegister;
        };

        // setup
        const PLUGIN_ERROR = 'plugin error';
        Pagination.plugin.register = async function() {
            throw new Error(PLUGIN_ERROR);
        };
        const server = Hapi.server();

        // exercise and validate
        await expect(server.register(Pagination)).to.reject(PLUGIN_ERROR);
    });
});
