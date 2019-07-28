const Lab = require('@hapi/lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const ResourceService = require('modules/authorization/services/resource');
const ResourceCtrl = require('modules/authorization/controllers/resource');
const NSError = require('errors/nserror');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('API Controller: resource', () => {
    const resources = [
        {
            name: 'user',
            permissions: [{ id: 1, action: 'create' }, { id: 2, action: 'delete' }]
        },
        {
            name: 'role',
            permissions: [{ id: 1, action: 'create' }, { id: 2, action: 'delete' }]
        },
        {
            name: 'user',
            description: 'a user'
        }
    ];

    let server;

    beforeEach(() => {
        // make server quiet, 500s are rethrown and logged by default..
        server = Hapi.server({ debug: { log: false, request: false } });
    });

    it('lists available resources', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
        };

        // setup
        const listStub = Sinon.stub(ResourceService, 'list').resolves(resources);

        server.route({ method: 'GET', path: '/resource', handler: ResourceCtrl.list });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/resource'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(resources);
    });

    it('handles server errors while listing resources', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
        };

        // setup
        const listStub = Sinon.stub(ResourceService, 'list').rejects(NSError.RESOURCE_FETCH());
        server.route({ method: 'GET', path: '/resource', handler: ResourceCtrl.list });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/resource'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(500);
        expect(response.statusMessage).to.equals('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('gets a resource by name', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByNameStub.restore();
        };

        // setup
        const findByNameStub = Sinon.stub(ResourceService, 'findByName');
        findByNameStub.withArgs('user').resolves(resources[2]);
        server.route({ method: 'GET', path: '/resource/{name}', handler: ResourceCtrl.getByName });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/resource/user'
        });

        // validate
        expect(findByNameStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(resources[2]);
    });

    it('handles server errors while getting a resource', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByNameStub.restore();
        };

        // setup
        const findByNameStub = Sinon.stub(ResourceService, 'findByName');
        findByNameStub.rejects(NSError.RESOURCE_FETCH());
        server.route({ method: 'GET', path: '/resource/{name}', handler: ResourceCtrl.getByName });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/resource/user'
        });

        // validate
        expect(findByNameStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('handles getting a resource with a invalid name', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByNameStub.restore();
        };

        // setup
        const findByNameStub = Sinon.stub(ResourceService, 'findByName');
        findByNameStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'GET', path: '/resource/{name}', handler: ResourceCtrl.getByName });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/resource/potato'
        });

        // validate
        expect(findByNameStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });
});
