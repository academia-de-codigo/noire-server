const Lab = require('@hapi/lab');
const Hapi = require('@hapi/hapi');
const Sinon = require('sinon');
const Logger = require('test/fixtures/logger-plugin');
const ContactsCtrl = require('modules/authorization/controllers/contacts');
const ContactsService = require('modules/authorization/services/contacts');
const NSError = require('errors/nserror');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('API Controller: contacts', () => {
    let server;

    const contacts = [
        { id: 1, email: 'admin@gmail.com', confirmed: true, signup_requests: 0 },
        { id: 2, email: 'test@gmail.com', confirmed: true, signup_requests: 0 },
        { id: 3, email: 'contact@gmail.com', confirmed: false, signup_requests: 0 },
        { id: 4, email: 'spammer@gmail.com', confirmed: false, signup_requests: 20 }
    ];

    beforeEach(async () => {
        // make server quiet, 500s are rethrown and logged by default..
        server = Hapi.server({ debug: { log: false, request: false } });
        await server.register(Logger);
    });

    it('performs user signup', async flags => {
        // cleanup
        flags.onCleanup = function() {
            ContactsService.signup.restore();
        };

        // setup
        const fakeEmail = 'test@test.com';
        Sinon.stub(ContactsService, 'signup').resolves();
        server.route({ method: 'POST', path: '/signup', handler: ContactsCtrl.signup });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/signup',
            payload: { email: fakeEmail }
        });

        // validate
        expect(ContactsService.signup.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.result.success).to.be.true();
        expect(response.result.message).to.equals('sign up');
    });

    it('handles user signup failure', async flags => {
        // cleanup
        flags.onCleanup = function() {
            ContactsService.signup.restore();
        };

        // setup
        Sinon.stub(ContactsService, 'signup').rejects();
        server.route({ method: 'POST', path: '/signup', handler: ContactsCtrl.signup });

        // exercise
        const response = await server.inject({
            method: 'POST',
            url: '/signup',
            payload: { email: '' }
        });

        // verify
        expect(ContactsService.signup.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('lists available contacts', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const listStub = Sinon.stub(ContactsService, 'list');
        const countStub = Sinon.stub(ContactsService, 'count');
        const toolkitStub = Sinon.stub()
            .withArgs(contacts, contacts.length)
            .returns(contacts);
        listStub.resolves(contacts);
        countStub.resolves(contacts.length);
        server.route({ method: 'GET', path: '/contact', handler: ContactsCtrl.list });
        server.decorate('toolkit', 'paginate', toolkitStub);

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/contact'
        });

        // validate
        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(toolkitStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(contacts);
    });

    it('lists available contacts with criteria', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const fakeCriteria = { limit: '1' };
        const listStub = Sinon.stub(ContactsService, 'list');
        const countStub = Sinon.stub(ContactsService, 'count');
        const toolkitStub = Sinon.stub()
            .withArgs(contacts, contacts.length)
            .returns([contacts[0]]);
        listStub.withArgs(fakeCriteria).resolves(contacts[0]);
        countStub.withArgs(fakeCriteria).resolves(1);
        server.route({ method: 'GET', path: '/contact', handler: ContactsCtrl.list });
        server.decorate('toolkit', 'paginate', toolkitStub);

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/contact?limit=1'
        });

        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(toolkitStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal([contacts[0]]);
    });

    it('handles server errors while listing contacts', async flags => {
        // cleanup
        flags.onCleanup = function() {
            listStub.restore();
            countStub.restore();
        };

        // setup
        const listStub = Sinon.stub(ContactsService, 'list');
        const countStub = Sinon.stub(ContactsService, 'count');
        listStub.rejects(NSError.RESOURCE_FETCH());
        countStub.resolves();
        server.route({ method: 'GET', path: '/contact', handler: ContactsCtrl.list });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/contact'
        });

        expect(listStub.calledOnce).to.be.true();
        expect(countStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('gets a contact', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(ContactsService, 'findById');
        findByIdStub.withArgs(1).resolves(contacts[0]);
        server.route({ method: 'GET', path: '/contact/{id}', handler: ContactsCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/contact/1'
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(200);
        expect(response.statusMessage).to.equal('OK');
        expect(response.result).to.equal(contacts[0]);
    });

    it('handles get of a non existing contact', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(ContactsService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'GET', path: '/contact/{id}', handler: ContactsCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/contact/2'
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(404);
        expect(response.statusMessage).to.equals('Not Found');
        expect(response.result.message).to.equals(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles server error while getting a user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            findByIdStub.restore();
        };

        // setup
        const findByIdStub = Sinon.stub(ContactsService, 'findById');
        findByIdStub.rejects(NSError.RESOURCE_FETCH());
        server.route({ method: 'GET', path: '/contact/{id}', handler: ContactsCtrl.get });

        // exercise
        const response = await server.inject({
            method: 'GET',
            url: '/contact/2'
        });

        // validate
        expect(findByIdStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(500);
        expect(response.statusMessage).to.equals('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });

    it('deletes an existing contact', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(ContactsService, 'delete');
        deleteStub.withArgs(2).resolves();
        server.route({ method: 'DELETE', path: '/contact/{id}', handler: ContactsCtrl.delete });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/contact/2'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equals(204);
        expect(response.statusMessage).to.equals('No Content');
    });

    it('handles deleting a contact that does not exist', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(ContactsService, 'delete');
        deleteStub.rejects(NSError.RESOURCE_NOT_FOUND());
        server.route({ method: 'DELETE', path: '/contact/2', handler: ContactsService.delete });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/contact/2'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(404);
        expect(response.statusMessage).to.equal('Not Found');
        expect(response.result.message).to.equal(NSError.RESOURCE_NOT_FOUND().message);
    });

    it('handles server errors while deleting a contact', async flags => {
        // cleanup
        flags.onCleanup = function() {
            deleteStub.restore();
        };

        // setup
        const deleteStub = Sinon.stub(ContactsService, 'delete');
        deleteStub.rejects(NSError.RESOURCE_FETCH());
        server.route({ method: 'DELETE', path: '/contact/2', handler: ContactsService.delete });

        // exercise
        const response = await server.inject({
            method: 'DELETE',
            url: '/contact/2'
        });

        // validate
        expect(deleteStub.calledOnce).to.be.true();
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.result.message).to.equal('An internal server error occurred');
    });
});
