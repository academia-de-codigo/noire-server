const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const Knex = require('knex');
const Logger = require('test/fixtures/logger-plugin');
const Objection = require('objection');
const KnexConfig = require('knexfile');
const Repository = require('plugins/repository');
const ContactsService = require('modules/authorization/services/contacts');
const Mailer = require('utils/mailer');
const Auth = require('plugins/auth');
const UserModel = require('models/user');
const ContactModel = require('models/contact');
const Config = require('config');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Service: contacts', () => {
    let knex;

    beforeEach(async () => {
        /*jshint -W064 */
        knex = Knex(KnexConfig.testing); // eslint-disable-line
        /*jshint -W064 */

        await knex.migrate.latest();
        await knex.seed.run();

        Objection.Model.knex(knex);

        const server = Hapi.server();
        server.register(Logger);
        server.register({
            plugin: Repository,
            options: { models: ['user', 'contact'] }
        });
    });

    it('signs up a new user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Mailer.sendMail.restore();
            Auth.getToken.restore();
            Repository.contact.add.restore();
        };

        // setup
        const fakeToken = 'fake-token';
        const fakeEmail = 'newmail@mail.com';

        const repoSpy = Sinon.spy(Repository.contact, 'add');
        Sinon.stub(Auth, 'getToken').resolves(fakeToken);
        Sinon.stub(Mailer, 'sendMail').callsFake(mail => {
            expect(mail.to).to.equal(fakeEmail);
            expect(mail.context).to.be.an.object();
            expect(mail.context.url).to.contains(fakeToken);
            return Promise.resolve();
        });

        // exercise
        await ContactsService.signup(fakeEmail);

        // validate
        expect(Mailer.sendMail.calledOnce).to.be.true();
        expect(repoSpy.calledOnce).to.be.true();
        expect(repoSpy.args[0][0].email).to.equal(fakeEmail);
        expect(repoSpy.args[0][0].confirmed).to.be.false();
        expect(repoSpy.args[0][0].signup_requests).to.be.equal(0);
    });

    it('does not sign up a user with another users email', async () => {
        // exercise and validate
        await expect(ContactsService.signup('admin@gmail.com')).reject(
            Error,
            'Email address already exists'
        );
    });

    it('does not create a new contact if already exists', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.getToken.restore();
            Mailer.sendMail.restore();
            Repository.contact.add.restore();
        };

        // setup
        const email = 'contact@gmail.com';
        const repoSpy = Sinon.spy(Repository.contact, 'add');
        Sinon.stub(Auth, 'getToken').resolves();
        Sinon.stub(Mailer, 'sendMail').resolves();

        // exercise
        await ContactsService.signup(email);

        // validate
        expect(Mailer.sendMail.calledOnce).to.be.true();
        expect(repoSpy.calledOnce).to.be.false();
    });

    it('does not sign up a user when maximum requests have been exceeded', async flags => {
        let signupRequestConfig;

        //cleanup
        flags.onCleanup = function() {
            Config.mail.maximumSignupRequests = signupRequestConfig;
        };

        //setup
        const email = 'spammer@gmail.com';
        const testSignupRequests = 20;
        const errorMessage = 'Maximum signup requests exceeded';
        signupRequestConfig = Config.mail.maximumSignupRequests;
        Config.mail.maximumSignupRequests = testSignupRequests;

        //exercise and validate
        await expect(ContactsService.signup(email)).rejects(Error, errorMessage);
    });

    it('handles token generation failures', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.getToken.restore();
        };

        // setup
        const fakeError = 'some error';
        Sinon.stub(Auth, 'getToken').throws(Error(fakeError));

        // exercise and validate
        await expect(ContactsService.signup('newmail@gmail.com')).rejects(Error, fakeError);
    });

    it('handles failures sending email', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.getToken.restore();
            Mailer.sendMail.restore();
        };

        // setup
        const fakeError = 'some error';
        Sinon.stub(Auth, 'getToken').resolves();
        Sinon.stub(Mailer, 'sendMail').throws(Error(fakeError));

        // exercise and validate
        await expect(ContactsService.signup('newmail@gmail.com')).rejects(Error, fakeError);
    });

    it('updates user sign up request counter', async flags => {
        let signupRequestConfig;

        //cleanup
        flags.onCleanup = function() {
            Config.mail.maximumSignupRequests = signupRequestConfig;
            Auth.getToken.restore();
            Mailer.sendMail.restore();
            Repository.contact.update.restore();
        };

        //setup
        const email = 'contact@gmail.com';
        const testSignupRequests = 5;
        signupRequestConfig = Config.mail.maximumSignupRequests;
        Config.mail.maximumSignupRequests = testSignupRequests;

        const repoSpy = Sinon.spy(Repository.contact, 'update');
        Sinon.stub(Auth, 'getToken').resolves();
        Sinon.stub(Mailer, 'sendMail').resolves();

        //exercise
        await ContactsService.signup(email);

        //validate
        expect(repoSpy.args[0][0].signup_requests).to.be.equal(1);
    });

    it('handles failures updating contact', async flags => {
        //cleanup
        flags.onCleanup = function() {
            Auth.getToken.restore();
            Mailer.sendMail.restore();
        };

        //setup
        const email = 'fake email';
        Sinon.stub(Auth, 'getToken').resolves();
        Sinon.stub(Mailer, 'sendMail').resolves();

        //exercise and validate
        await expect(ContactsService.signup(email)).rejects(Error);
    });

    it('registers a new user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Repository.tx.restore();
            Auth.crypt.restore();
        };

        // setup
        const fakePassHash = 'crypted-password';
        const txSpy = Sinon.spy(Repository, 'tx');
        Sinon.stub(Auth, 'crypt').resolves(fakePassHash);
        const fakeUser = {
            name: 'new contact',
            username: 'contact',
            email: 'contact@gmail.com',
            password: 'somepass'
        };

        // exercise
        const result = await ContactsService.register(3, fakeUser);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(3);
        expect(txSpy.args[0][0]).to.equals(UserModel);
        expect(txSpy.args[0][1]).to.equals(ContactModel);
        expect(result).instanceof(Objection.Model);
        expect(result.name).to.equal(fakeUser.name);
        expect(result.username).to.equal(fakeUser.username);
        expect(result.email).to.equal(fakeUser.email);
        expect(result.password).to.equal(fakePassHash);
    });

    it('does not register a new user if contact is not found', async () => {
        // exercise and validate
        await expect(ContactsService.register(999, {})).rejects(Error, 'Invalid email address');
    });

    it('does not register a new user if email is not found', async () => {
        // exercise and validate
        await expect(ContactsService.register(3, { email: 'fake' })).rejects(
            Error,
            'Invalid email address'
        );
    });

    it('does not register a new user if previously registered', async () => {
        // exercise and validate
        await expect(ContactsService.register(1, { email: 'admin@gmail.com' })).rejects(
            Error,
            'User already exists'
        );
    });

    it('handles password hash calculation errors', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.crypt.restore();
        };

        // setup
        const fakeError = 'some error';
        Sinon.stub(Auth, 'crypt').rejects(Error(fakeError));

        // exercisae and validate
        await expect(
            ContactsService.register(3, { username: 'contact', email: 'contact@gmail.com' })
        ).rejects(Error, fakeError);
    });

    it('does not register a new user if it already exists', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.crypt.restore();
        };

        // setup
        Sinon.stub(Auth, 'crypt').resolves('pass-hash');

        // exercise and validate
        await expect(
            ContactsService.register(3, { username: 'admin', email: 'contact@gmail.com' })
        ).rejects(Error, 'User already exists');
    });

    it('updates user contact after registering', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.crypt.restore();
        };

        // setup
        const fakePassHash = 'crypted-password';
        Sinon.stub(Auth, 'crypt').resolves(fakePassHash);
        const fakeUser = {
            name: 'new contact',
            username: 'contact',
            email: 'spammer@gmail.com',
            password: 'somepass'
        };

        // exercise
        await ContactsService.register(4, fakeUser);

        // validate
        const [result] = await knex('contacts')
            .where('email', fakeUser.email)
            .select('confirmed');

        expect(!!result.confirmed).to.be.true();
    });
});
