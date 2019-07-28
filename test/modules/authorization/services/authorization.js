const Lab = require('@hapi/lab');
const Hapi = require('@hapi/hapi');
const Knex = require('knex');
const Objection = require('objection');
const KnexConfig = require('knexfile');
const Repository = require('plugins/repository');
const AuthorizationService = require('modules/authorization/services/authorization');
const NSError = require('errors/nserror');
const Logger = require('test/fixtures/logger-plugin');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Service: authorization', () => {
    beforeEach(async () => {
        /*jshint -W064 */
        const knex = Knex(KnexConfig.testing); // eslint-disable-line
        /*jshint -W064 */

        await knex.migrate.latest();
        await knex.seed.run();

        Objection.Model.knex(knex);

        const server = Hapi.server();
        server.register(Logger);
        server.register({
            plugin: Repository,
            options: { models: ['user', 'role', 'resource', 'permission'] }
        });
    });

    it('authorizes a role with the right permissions', async () => {
        // exercise
        const result = await AuthorizationService.canRole('admin', 'read', 'user');

        // validate
        expect(result).to.be.true();
    });

    it('does not authorize a role with the wrong permissions', async () => {
        // exercise
        const result = await AuthorizationService.canRole('user', 'create', 'user');

        // validate
        expect(result).to.be.false();
    });

    it('does not authorize a role with no permissions', async () => {
        // exercise
        const result = await AuthorizationService.canRole('guest', 'read', 'role');

        // validate
        expect(result).to.be.false();
    });

    it('does not authorize a role for an invalid action', async () => {
        // exercise
        const result = await AuthorizationService.canRole('guest', 'invalid action', 'role');

        // validate
        expect(result).to.be.false();
    });

    it('handles authorization for a non existing role', async () => {
        // exercise and validate
        await expect(AuthorizationService.canRole('invalid', 'read', 'role')).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('handles authorization for a non existing resource', async () => {
        // exercise and validate
        await expect(AuthorizationService.canRole('guest', 'read', 'invalid resource')).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('authorizes a user that has a role with the right permissions', async () => {
        // exercise
        const result = await AuthorizationService.canUser('admin', 'create', 'user');

        // validate
        expect(result).to.be.true();
    });

    it('authorizes a user that has multiple roles with the right permissions', async () => {
        // exercise
        const result = await AuthorizationService.canUser('admin', 'read', 'role');

        // validate
        expect(result).to.be.true();
    });

    it('does not authorize a user that has no roles with the right permissions', async () => {
        // exercise
        const result = await AuthorizationService.canUser('test', 'create', 'user');

        // validate
        expect(result).to.be.false();
    });

    it('does not authorize a user that has no roles', async () => {
        // exercise
        const result = await AuthorizationService.canUser('noroles', 'read', 'role');

        // validate
        expect(result).to.be.false();
    });

    it('handles authorization for a non existing user', async () => {
        // exercise and validate
        await expect(AuthorizationService.canUser('invalid user', 'read', 'role')).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });
});
