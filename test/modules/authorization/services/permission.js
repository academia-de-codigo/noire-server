const Lab = require('@hapi/lab');
const Hapi = require('hapi');
const Knex = require('knex');
const Sinon = require('sinon');
const Objection = require('objection');
const KnexConfig = require('knexfile');
const PermissionService = require('modules/authorization/services/permission');
const Repository = require('plugins/repository');
const PermissionModel = require('models/permission');
const ResourceModel = require('models/resource');
const NSError = require('errors/nserror');
const Logger = require('test/fixtures/logger-plugin');
const Resources = require('enums/resources');

const { afterEach, beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Service: permission', function() {
    let txSpy;
    let knex;

    beforeEach(async () => {
        knex = Knex(KnexConfig.testing);

        await knex.migrate.latest();
        await knex.seed.run();

        Objection.Model.knex(knex);

        const server = Hapi.server();
        server.register(Logger);
        server.register({
            plugin: Repository,
            options: {
                models: ['permission', 'resource']
            }
        });

        txSpy = Sinon.spy(Repository, 'tx');
    });

    afterEach(() => {
        if (txSpy) {
            txSpy.restore();
        }
    });

    it('counts permissions', async () => {
        // exercise
        const result = await PermissionService.count();

        // validate
        expect(result).to.equal(10);
    });

    it('counts permissions with a limit criteria', async () => {
        // setup
        const criteria = { limit: 1 };

        // exercise
        const result = await PermissionService.count(criteria);

        // validate
        expect(result).to.equal(10);
    });

    it('counts permissions with a search criteria', async () => {
        // setup
        const criteria = { search: 'Should not change' };

        // exercise
        const result = await PermissionService.count(criteria);

        // validate
        expect(result).to.equal(2);
    });

    it('counts permissions with a search criteria for the related permission resource', async () => {
        // setup
        const criteria = { search: 'user' };

        // exercise
        const result = await PermissionService.count(criteria);

        // validate
        expect(result).to.equal(4);
    });

    it('counts permissions with limit and search criteria for the related permission resource', async () => {
        // setup
        const criteria = { search: 'user', limit: 1 };

        // exercise
        const result = await PermissionService.count(criteria);

        // validate
        expect(result).to.equal(4);
    });

    it('lists permissions', async () => {
        // exercise
        const results = await PermissionService.list();

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equal(10);
        expect(results.resource).to.not.exist();

        results.forEach(permission => {
            expect(permission).to.be.instanceof(PermissionModel);
            expect(permission.id).to.exist();
            expect(permission.action).to.be.a.string();
            expect(permission.resource).to.be.an.instanceof(ResourceModel);
            expect(permission.description).to.satisfy(
                value => value === null || typeof value === 'string'
            );
        });
    });

    it('lists permissions with limit criteria', async () => {
        // setup
        const criteria = { limit: 2 };

        // exercise
        const results = await PermissionService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equal(2);
        expect(results.resource).to.not.exist();

        results.forEach(permission => {
            expect(permission).to.be.instanceof(PermissionModel);
            expect(permission.id).to.exist();
            expect(permission.action).to.be.a.string();
            expect(permission.resource).to.be.an.instanceof(ResourceModel);
            expect(permission.description).to.satisfy(
                value => value === null || typeof value === 'string'
            );
        });
    });

    it('lists permissions with search criteria', async () => {
        // setup
        const criteria = { search: Resources.USER };

        // exercise
        const results = await PermissionService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equal(4);
        expect(results.resource).to.not.exist();

        results.forEach(permission => {
            expect(permission).to.be.instanceof(PermissionModel);
            expect(permission.id).to.exist();
            expect(permission.action).to.be.a.string();
            expect(permission.resource).to.be.an.instanceof(ResourceModel);
            expect(permission.description).to.satisfy(
                value => value === null || typeof value === 'string'
            );
        });
    });

    it('lists permissions with offset', async () => {
        // setup
        const criteria = { page: 2, limit: 2 };

        // exercise
        const results = await PermissionService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equal(2);
        expect(results.resource).to.not.exist();

        results.forEach(permission => {
            expect(permission).to.be.instanceof(PermissionModel);
            expect(permission.id > 2).to.be.true();
            expect(permission.action).to.be.a.string();
            expect(permission.resource).to.be.an.instanceof(ResourceModel);
            expect(permission.description).to.satisfy(
                value => value === null || typeof value === 'string'
            );
        });
    });

    it('lists permissions ordered by column', async () => {
        // setup
        const criteria = { sort: 'description' };

        // exercise
        const results = await PermissionService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equal(10);
        expect(results.resource).to.not.exist();

        results.forEach(permission => {
            expect(permission).to.be.instanceof(PermissionModel);
            expect(permission.id).to.exist();
            expect(permission.action).to.be.a.string();
            expect(permission.resource).to.be.an.instanceof(ResourceModel);
            expect(permission.description).to.satisfy(
                value => value === null || typeof value === 'string'
            );
        });
    });

    it('lists permissions by column descending', async () => {
        // setup
        const criteria = { sort: '-id' };

        // exercise
        const results = await PermissionService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equal(10);
        expect(results.resource).to.not.exist();
        expect(results[0].id > results[1].id).to.be.true();

        results.forEach(permission => {
            expect(permission).to.be.instanceof(PermissionModel);
            expect(permission.id).to.exist();
            expect(permission.action).to.be.a.string();
            expect(permission.resource).to.be.an.instanceof(ResourceModel);
            expect(permission.description).to.satisfy(
                value => value === null || typeof value === 'string'
            );
        });
    });

    it('lists permissions by column descending and limit criteria', async () => {
        // setup
        const criteria = { sort: '-id', limit: 2 };

        // exercise
        const results = await PermissionService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equal(2);
        expect(results.resource).to.not.exist();
        expect(results[0].id > results[1].id).to.be.true();

        results.forEach(permission => {
            expect(permission).to.be.instanceof(PermissionModel);
            expect(permission.id).to.exist();
            expect(permission.action).to.be.a.string();
            expect(permission.resource).to.be.an.instanceof(ResourceModel);
            expect(permission.description).to.satisfy(
                value => value === null || typeof value === 'string'
            );
        });
    });

    it('lists permissions by column descending, limit and search criteria for the related permission resource', async () => {
        // setup
        const criteria = { sort: '-id', limit: 2, search: 'user' };

        // exercise
        const results = await PermissionService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equal(2);
        expect(results.resource).to.not.exist();
        expect(results[0].id > results[1].id).to.be.true();

        results.forEach(permission => {
            expect(permission).to.be.instanceof(PermissionModel);
            expect(permission.id).to.exist();
            expect(permission.action).to.be.a.string();
            expect(permission.resource).to.be.an.instanceof(ResourceModel);
            expect(permission.description).to.satisfy(
                value => value === null || typeof value === 'string'
            );
        });
    });

    it('gets valid permission by id', async () => {
        // setup
        const id = 9;
        const permission = {
            id: 9,
            action: 'read',
            description: 'Should not change'
        };

        // exercise
        const result = await PermissionService.findById(id);

        // validate
        expect(result).to.be.an.object();
        expect(result).to.be.instanceof(PermissionModel);

        expect(result.id).to.equal(permission.id);
        expect(result.action).to.equal(permission.action);
        expect(result.description).to.equal(permission.description);
        expect(result.resource).to.be.an.instanceof(ResourceModel);
    });

    it('handles getting a permission with an invalid id', async () => {
        // exercise and validade
        await expect(PermissionService.findById(666)).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('adds a new permission', async () => {
        // setup
        const permission = {
            id: 11,
            action: 'delete',
            description: 'potato',
            resource: 'noroles'
        };

        // exercise
        const result = await PermissionService.add(permission);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equal(2);

        expect(txSpy.args[0][0].indexOf(PermissionModel)).to.not.equal(-1);
        expect(txSpy.args[0][0].indexOf(ResourceModel)).to.not.equal(-1);

        expect(result).to.be.an.instanceof(PermissionModel);
        expect(result.id).to.equal(permission.id);
        expect(result.action).to.equal(permission.action);
        expect(result.description).to.equal(permission.description);
        expect(result.resourceId).to.equal(4);
    });

    it('does not add a permission with the same action for the same resource', async () => {
        // setup
        const entity = {
            action: 'read',
            description: 'potato',
            resource: 'user'
        };

        // exercise and validate
        await expect(PermissionService.add(entity)).to.reject(
            Error,
            NSError.RESOURCE_DUPLICATE().message
        );
    });

    it('does not add a permission for an invalid resource', async () => {
        // setup
        const entity = {
            action: 'delete',
            description: 'potato',
            resource: 'potato'
        };

        // exercise and validate
        await expect(PermissionService.add(entity)).to.reject(Error, 'Invalid resource name');
    });

    it('does not add a permission with an invalid action', async () => {
        // exercise and validate
        expect(() => PermissionService.add({ action: 'xpto' })).to.throw(Error, 'Invalid action');
    });

    it('deletes an existing permission', async () => {
        // setup
        const id = 9;

        // exercise
        const result = await PermissionService.delete(id);

        //validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equal(2);
        expect(txSpy.args[0][0]).to.equal(PermissionModel);
        expect(result).to.not.exist();

        expect(
            await knex('permissions')
                .where('id', id)
                .first()
        ).to.not.exist();
    });

    it('does not delete a non existing permission', async () => {
        // exercise and validate
        await expect(PermissionService.delete(999)).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('does not delete a permission associated with roles', async () => {
        // exercise and validate
        await expect(PermissionService.delete(1)).to.reject(
            Error,
            NSError.RESOURCE_RELATION().message
        );
    });

    it('updates an existing permission', async () => {
        // setup
        const id = 9;
        const permission = { description: 'potato' };

        // exercise
        const result = await PermissionService.update(id, permission);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equal(2);
        expect(txSpy.args[0][0]).to.equal(PermissionModel);
        expect(result).to.be.instanceof(PermissionModel);
        expect(result.id).to.equal(id);
        expect(result.description).to.equal(permission.description);
    });

    it('handles updating a non existing permission', async () => {
        // exercise and validate
        await expect(PermissionService.update(999)).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });
});
