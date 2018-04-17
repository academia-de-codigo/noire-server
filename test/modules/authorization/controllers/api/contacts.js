const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const Logger = require('test/fixtures/logger-plugin');
const ContactsCtrl = require('modules/authorization/controllers/api/contacts');
const ContactsService = require('modules/authorization/services/contacts');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('API Controller: contacts', () => {
    let server;

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
        expect(JSON.parse(response.payload).success).to.be.true();
        expect(JSON.parse(response.payload).message).to.equals('sign up');
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
        expect(JSON.parse(response.payload).message).to.equal('An internal server error occurred');
    });
});
