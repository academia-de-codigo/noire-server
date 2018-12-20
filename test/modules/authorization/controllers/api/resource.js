const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const ResourceService = require('modules/authorization/services/resource');
const ResourceCtrl = require('modules/authorization/controllers/api/resource');
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
});
