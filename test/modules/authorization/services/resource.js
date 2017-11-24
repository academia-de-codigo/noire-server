const Lab = require('lab');
const Hapi = require('hapi');
const Knex = require('knex');
const Sinon = require('sinon');
const Objection = require('objection');
const Path = require('path');
const KnexConfig = require(Path.join(process.cwd(), 'knexfile'));
const ResourceService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/resource'));
const Repository = require(Path.join(process.cwd(), 'lib/plugins/repository'));
const ResourceModel = require(Path.join(process.cwd(), 'lib/models/resource'));
const NSError = require(Path.join(process.cwd(), 'lib/errors/nserror'));

const { afterEach, beforeEach, describe, expect, it } = exports.lab = Lab.script();

describe('Service: resource', () => {

    let txSpy;

    beforeEach(async () => {

        /*jshint -W064 */
        const knex = Knex(KnexConfig.testing); // eslint-disable-line
        /*jshint -W064 */

        await knex.migrate.latest();
        await knex.seed.run();

        Objection.Model.knex(knex);

        const server = Hapi.server();
        server.register({ plugin: Repository, options: { models: ['resource', 'permission'] } });

        txSpy = Sinon.spy(Repository, 'tx');
    });

    afterEach(() => {

        if (txSpy) {
            txSpy.restore();
        }
    });

    it('counts resources', async () => {

        // exercise
        const result = await ResourceService.count();

        // validate
        expect(result).to.equals(4);
    });

    it('counts resources with search criteria', async () => {

        // setup
        const criteria = { search: 'user' };

        // exercise
        const result = await ResourceService.count(criteria);

        // validate
        expect(result).to.equals(1);
    });

    it('lists resources', async () => {

        // exercise
        const results = await ResourceService.list();

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        results.forEach(resource => {
            expect(resource).to.be.instanceof(ResourceModel);
            expect(resource.id).to.exists();
            expect(resource.name).to.be.a.string();
        });
    });

    it('lists resources with a search clause', async () => {

        // setup
        const criteria = { search: 'use' };

        // exercise
        const results = await ResourceService.list(criteria);
        expect(results).to.be.an.array();
        expect(results.length).to.equals(1);
        expect(results[0]).to.be.instanceof(ResourceModel);
        expect(results[0].id === 1).to.be.true();
        expect(results[0].name).to.be.a.string();
    });

    it('lists resources with limit', async () => {

        // setup
        const criteria = { limit: 2 };

        // exercise
        const results = await ResourceService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(2);
        results.forEach(resource => {
            expect(resource).to.be.instanceof(ResourceModel);
            expect(resource.id).to.exists();
            expect(resource.id < 3).to.be.true();
            expect(resource.name).to.be.a.string();
        });
    });

    it('lists resources with offset', async () => {

        // setup
        const criteria = { page: 4, limit: 1 };

        // exercise
        const results = await ResourceService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(1);
        results.forEach(resource => {
            expect(resource).to.be.instanceof(ResourceModel);
            expect(resource.id > 3).to.be.true();
            expect(resource.name).to.be.a.string();
        });
    });

    it('lists resources ordered by column', async () => {

        // setup
        const criteria = { sort: 'name' };

        // exercise
        const results = await ResourceService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        results.forEach(resource => {
            expect(resource).to.be.instanceof(ResourceModel);
            expect(resource.id).to.exist();
            expect(resource.name).to.be.a.string();
        });
    });

    it('lists resources ordered by id, descending', async () => {

        // setup
        const criteria = { sort: 'id', descending: true };

        // exercise
        const results = await ResourceService.list(criteria);
        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        expect(results[0].id > results[1].id).to.be.true();
        results.forEach(resource => {
            expect(resource).to.be.instanceof(ResourceModel);
            expect(resource.id).to.exist();
            expect(resource.name).to.be.a.string();
        });
    });

    it('gets valid resource by id', async () => {

        // setup
        const id = 1;
        const resource = { name: 'user' };

        // exercise
        const result = await ResourceService.findById(id);

        // validate
        expect(result).to.be.an.object();
        expect(result).to.be.instanceof(ResourceModel);
        expect(result.id).to.equals(id);
        expect(result.name).to.equals(resource.name);
    });

    it('handles getting invalid resource by id', async () => {

        // exercise and validate
        await expect(ResourceService.findById(999)).to.reject(Error, NSError.RESOURCE_NOT_FOUND().message);
    });

    it('gets valid resource by name', async () => {

        // setup
        const resource = { id: 1, name: 'user' };

        // exercise
        const result = await ResourceService.findByName('user');
        expect(result).to.be.instanceof(ResourceModel);
        expect(result.id).to.equals(resource.id);
        expect(result.name).to.equals(resource.name);
    });

    it('handles getting invalid resource by name', async () => {

        // exercise and validate
        await expect(ResourceService.findByName('invalid')).to.reject(Error, NSError.RESOURCE_NOT_FOUND().message);
    });

    it('adds a new resource', async () => {

        // setup
        const resource = { id: 10, name: 'newresource' };

        // exercise
        const result = await ResourceService.add(resource);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(2);
        expect(txSpy.args[0][0]).to.equals(ResourceModel);
        expect(result).to.be.an.instanceof(ResourceModel);
        expect(result.id).to.equals(resource.id);
        expect(result.name).to.equals(resource.name);
    });

    it('does not add an existing resource', async () => {

        // exercise and validate
        await expect(ResourceService.add({ name: 'user' })).to.reject(Error, NSError.RESOURCE_DUPLICATE().message);
    });

    it('deletes an existing resource', async () => {

        // exercise
        const result = await ResourceService.delete(3);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(result).to.not.exists();
    });

    it('handles deleting a non existing resource', async () => {

        // exercise and validate
        await expect(ResourceService.delete(999)).to.reject(Error, NSError.RESOURCE_NOT_FOUND().message);
    });

    it('does not delete a resource if permissions using it exist', async () => {

        // exercise and validate
        await expect(ResourceService.delete(1)).to.reject(Error, NSError.RESOURCE_RELATION().message);
    });

    it('updates an existing resource', async () => {

        // setup
        const id = 3;
        const resource = { name: 'newname' };

        // exercise
        const result = await ResourceService.update(id, resource);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(2);
        expect(txSpy.args[0][0]).to.equals(ResourceModel);
        expect(result).to.be.an.instanceof(ResourceModel);
        expect(result.id).to.equals(id);
        expect(result.name).to.equals(resource.name);
    });

    it('handles updating a non existing resource', async () => {

        // exercise and validate
        await expect(ResourceService.update(999, { name: 'newname' })).to.reject(Error, NSError.RESOURCE_NOT_FOUND().message);
    });

    it('does not update a resource with same name as an already existing resource', async () => {

        // exercise and validate
        await expect(ResourceService.update(3, { name: 'user' })).to.reject(Error, NSError.RESOURCE_DUPLICATE().message);
    });
});
