const Lab = require('lab');
const Sinon = require('sinon');
const Hapi = require('hapi');
const Knex = require('knex');
const Logger = require('test/fixtures/logger-plugin');
const Objection = require('objection');
const KnexConfig = require('knexfile');
const Repository = require('plugins/repository');
const URL = require('url');
const QS = require('qs');
const ContactsService = require('modules/authorization/services/contacts');
const Mailer = require('utils/mailer');
const Auth = require('plugins/auth');
const UserModel = require('models/user');
const ContactModel = require('models/contact');
const NSError = require('errors/nserror');
const Config = require('config');

const { beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Service: contacts', () => {
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
            options: { models: ['user', 'contact'] }
        });
    });

    it('counts contacts', async () => {
        // exercise
        const result = await ContactsService.count();

        // validate
        expect(result).equals(4);
    });

    it('counts contacts with a search criteria', async () => {
        // setup
        const criteria = { search: 't' }; // finds any contact with an email containing t

        // exercise
        const result = await ContactsService.count(criteria);

        // validate
        expect(result).equals(2);
    });

    it('lists contacts', async () => {
        // exercise
        const results = await ContactsService.list();

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        results.forEach(contact => {
            expect(contact).to.be.an.instanceof(ContactModel);
            expect(contact.id).to.exists();
            expect(contact.email).to.be.a.string();
            expect(contact.confirmed).to.be.a.boolean();
            expect(contact.signupRequests).to.be.a.number();
            expect(contact.signupRequests).to.be.at.least(0);
        });
    });

    it('lists contacts with a search clause', async () => {
        // setup
        const criteria = { search: 'test' };

        // exercise
        const results = await ContactsService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(1);
        expect(results[0]).to.be.an.instanceof(ContactModel);
        expect(results[0].id).to.equals(2);
        expect(results[0].email).to.be.a.string();
        expect(results[0].confirmed).to.be.a.boolean();
        expect(results[0].signupRequests).to.be.a.number();
        expect(results[0].signupRequests).to.be.at.least(0);
    });

    it('lists contacts with a limit clause', async () => {
        // setup
        const criteria = { limit: 2 };

        // exercise
        const results = await ContactsService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(2);
        expect(results[0].id).to.equals(1);
        expect(results[1].id).to.equals(2);
        results.forEach(contact => {
            expect(contact).to.be.instanceof(ContactModel);
            expect(contact.id).to.exists();
            expect(contact.email).to.be.a.string();
            expect(contact.confirmed).to.be.a.boolean();
            expect(contact.signupRequests).to.be.a.number();
            expect(contact.signupRequests).to.be.at.least(0);
        });
    });

    it('lists contacts with an offset', async () => {
        // setup
        const criteria = { page: 4, limit: 1 };

        // exercise
        const results = await ContactsService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(1);
        results.forEach(contact => {
            expect(contact).to.be.instanceof(ContactModel);
            expect(contact.id > 3).to.be.true();
            expect(contact.email).to.be.a.string();
            expect(contact.confirmed).to.be.a.boolean();
            expect(contact.signupRequests).to.be.a.number();
            expect(contact.signupRequests).to.be.at.least(0);
        });
    });

    it('lists contacts ordered by column', async () => {
        // setup
        const criteria = { sort: 'email' };

        // exercise
        const results = await ContactsService.list(criteria);

        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        expect(results.roles).to.not.exist();
        results.forEach(contact => {
            expect(contact).to.be.instanceof(ContactModel);
            expect(contact).to.exists();
            expect(contact.email).to.be.a.string();
            expect(contact.confirmed).to.be.a.boolean();
            expect(contact.signupRequests).to.be.a.number();
            expect(contact.signupRequests).to.be.at.least(0);
        });
    });

    it('lists users order by id descending', async () => {
        // setup
        const criteria = { sort: '-id' };

        // exercise
        const results = await ContactsService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        expect(results.roles).to.not.exists();
        results.forEach((contact, index) => {
            expect(contact).to.be.instanceof(ContactModel);
            expect(contact).to.exists();
            expect(contact.email).to.be.a.string();
            expect(contact.confirmed).to.be.a.boolean();
            expect(contact.signupRequests).to.be.a.number();
            expect(contact.signupRequests).to.be.at.least(0);
            expect(contact.id).to.equals(results.length - index);
        });
    });

    it('gets valid contact by id', async () => {
        // setup
        const id = 1;
        const contact = { id: 1, email: 'admin@gmail.com', confirmed: true, signupRequests: 0 };

        // exercise
        const result = await ContactsService.findById(id);

        // validate
        expect(result).to.be.an.object();
        expect(result).to.be.instanceof(ContactModel);
        expect(result.id).to.equals(contact.id);
        expect(result.email).to.equals(contact.email);
        expect(result.confirmed).to.equals(contact.confirmed);
        expect(result.signupRequests).to.equals(contact.signupRequests);
    });

    it('handles getting a non existing contact', async () => {
        await expect(ContactsService.findById(9999)).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('deletes an existing contact', async flags => {
        // cleanup
        flags.onCleanup = function() {
            txSpy.restore();
        };

        // setup
        const id = 2;
        const txSpy = Sinon.spy(Repository, 'tx');

        // exercise
        const result = await ContactsService.delete(id);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(2);
        expect(txSpy.args[0][0]).to.equals(ContactModel);
        expect(result).to.not.exist();

        expect(
            await knex('contacts')
                .where('id', id)
                .first()
        ).to.not.exist();
    });

    it('handles deleting a non existing contact', async () => {
        await expect(ContactsService.delete(9999)).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('signs up a new user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Mailer.sendMail.restore();
            Auth.getToken.restore();
            Repository.Contact.add.restore();
        };

        // setup
        const fakeHost = 'localhost';
        const fakeToken = 'fake-token';
        const fakeEmail = 'newmail@mail.com';

        const repoSpy = Sinon.spy(Repository.Contact, 'add');
        Sinon.stub(Auth, 'getToken').resolves(fakeToken);
        Sinon.stub(Mailer, 'sendMail').callsFake(mail => {
            expect(mail.to).to.equal(fakeEmail);
            expect(mail.context).to.be.an.object();
            expect(mail.context.url).to.contains(fakeToken);
            return Promise.resolve();
        });

        // exercise
        await ContactsService.signup(fakeHost, fakeEmail);

        // validate
        expect(Mailer.sendMail.calledOnce).to.be.true();
        expect(Mailer.sendMail.args[0][0].from).to.equals(Config.mail.address.signup);
        expect(Mailer.sendMail.args[0][0].to).to.equals(fakeEmail);
        expect(Mailer.sendMail.args[0][0].template).to.equals('user-signup');
        expect(Mailer.sendMail.args[0][0].context).to.be.an.object();
        expect(Mailer.sendMail.args[0][0].context.url).to.be.a.string();
        expect(Mailer.sendMail.args[0][0].context.url).to.startWith(fakeHost);
        expect(URL.parse(Mailer.sendMail.args[0][0].context.url).pathname).to.endWith(
            Config.mail.url.signup
        );
        expect(QS.parse(URL.parse(Mailer.sendMail.args[0][0].context.url).query)).to.include({
            token: fakeToken
        });
        expect(repoSpy.calledOnce).to.be.true();
        expect(repoSpy.args[0][0].email).to.equal(fakeEmail);
        expect(repoSpy.args[0][0].confirmed).to.be.false();
        expect(repoSpy.args[0][0].signupRequests).to.be.equal(0);
    });

    it('does not sign up a user with another users email', async () => {
        // exercise and validate
        await expect(ContactsService.signup('localhost', 'admin@gmail.com')).reject(
            Error,
            'Email address already exists'
        );
    });

    it('does not create a new contact if already exists', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.getToken.restore();
            Mailer.sendMail.restore();
            Repository.Contact.add.restore();
        };

        // setup
        const email = 'contact@gmail.com';
        const repoSpy = Sinon.spy(Repository.Contact, 'add');
        Sinon.stub(Auth, 'getToken').resolves();
        Sinon.stub(Mailer, 'sendMail').resolves();

        // exercise
        await ContactsService.signup('localhost', email);

        // validate
        expect(Mailer.sendMail.calledOnce).to.be.true();
        expect(repoSpy.calledOnce).to.be.false();
    });

    it('does not sign up a user when maximum requests have been exceeded', async flags => {
        let signupRequestConfig;

        // cleanup
        flags.onCleanup = function() {
            Config.mail.maximumSignupRequests = signupRequestConfig;
        };

        // setup
        const email = 'spammer@gmail.com';
        const testSignupRequests = 20;
        const errorMessage = 'Maximum signup requests exceeded';
        signupRequestConfig = Config.mail.maximumSignupRequests;
        Config.mail.maximumSignupRequests = testSignupRequests;

        // exercise and validate
        await expect(ContactsService.signup('localhost', email)).rejects(Error, errorMessage);
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
        await expect(ContactsService.signup('localhost', 'newmail@gmail.com')).rejects(
            Error,
            fakeError
        );
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
        await expect(ContactsService.signup('localhost', 'newmail@gmail.com')).rejects(
            Error,
            fakeError
        );
    });

    it('updates user sign up request counter', async flags => {
        let signupRequestConfig;

        // cleanup
        flags.onCleanup = function() {
            Config.mail.maximumSignupRequests = signupRequestConfig;
            Auth.getToken.restore();
            Mailer.sendMail.restore();
            Repository.Contact.update.restore();
        };

        // setup
        const email = 'contact@gmail.com';
        const testSignupRequests = 5;
        signupRequestConfig = Config.mail.maximumSignupRequests;
        Config.mail.maximumSignupRequests = testSignupRequests;

        const repoSpy = Sinon.spy(Repository.Contact, 'update');
        Sinon.stub(Auth, 'getToken').resolves();
        Sinon.stub(Mailer, 'sendMail').resolves();

        // exercise
        await ContactsService.signup('localhost', email);

        // validate
        expect(repoSpy.args[0][0].signupRequests).to.be.equal(1);
    });

    it('handles failures updating contact', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.getToken.restore();
            Mailer.sendMail.restore();
        };

        // setup
        const email = 'fake email';
        Sinon.stub(Auth, 'getToken').resolves();
        Sinon.stub(Mailer, 'sendMail').resolves();

        // exercise and validate
        await expect(ContactsService.signup('localhost', email)).rejects(Error);
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
        expect(txSpy.args[0].length).to.equals(2);
        expect(txSpy.args[0][0].indexOf(UserModel)).to.not.be.equals(-1);
        expect(txSpy.args[0][0].indexOf(ContactModel)).to.not.be.equals(-1);
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

        // exercise and validate
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
