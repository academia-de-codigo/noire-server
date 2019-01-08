const Lab = require('lab');
const Hapi = require('hapi');
const Sinon = require('sinon');
const Knex = require('knex');
const Objection = require('objection');
const KnexConfig = require('knexfile');
const URL = require('url');
const QS = require('qs');
const UserService = require('modules/authorization/services/user');
const Repository = require('plugins/repository');
const UserModel = require('models/user');
const RoleModel = require('models/role');
const Auth = require('plugins/auth');
const Mailer = require('utils/mailer');
const NSError = require('errors/nserror');
const Logger = require('test/fixtures/logger-plugin');
const Config = require('config');

const { afterEach, beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Service: user', () => {
    let cryptStub;
    let txSpy;

    beforeEach(async () => {
        /*jshint -W064 */
        const knex = Knex(KnexConfig.testing); // eslint-disable-line
        /*jshint -W064 */

        await knex.migrate.latest();
        await knex.seed.run();

        Objection.Model.knex(knex);

        const server = Hapi.server();
        server.register(Logger);
        server.register({ plugin: Repository, options: { models: ['user', 'role'] } });

        txSpy = Sinon.spy(Repository, 'tx');
    });

    afterEach(() => {
        if (txSpy) {
            txSpy.restore();
        }

        if (cryptStub) {
            cryptStub.restore();
        }
    });

    it('counts users', async () => {
        // exercise
        const result = await UserService.count();

        // validate
        expect(result).to.equals(4);
    });

    it('counts users with a search criteria', async () => {
        // setup
        const criteria = { search: 't u' }; //finds guest and test users

        // exercise
        const result = await UserService.count(criteria);

        // validate
        expect(result).to.equals(2);
    });

    it('lists users', async () => {
        // exercise
        const results = await UserService.list();

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        expect(results.roles).to.not.exists();
        results.forEach(user => {
            expect(user).to.be.instanceof(UserModel);
            expect(user.id).to.exists();
            expect(user.username).to.be.a.string();
            expect(user.email).to.be.a.string();
            expect(user.password).to.not.exists();
        });
    });

    it('lists users with a search clause', async () => {
        // setup
        const criteria = { search: 'tes' };

        // exercise
        const results = await UserService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(1);
        expect(results.roles).to.not.exists();
        expect(results[0]).to.be.instanceof(UserModel);
        expect(results[0].id === 2).to.be.true();
        expect(results[0].username).to.be.a.string();
        expect(results[0].email).to.be.a.string();
        expect(results[0].password).to.not.exists();
    });

    it('lists users with limit', async () => {
        // setup
        const criteria = { limit: 2 };

        // exercise
        const results = await UserService.list(criteria);

        expect(results).to.be.an.array();
        expect(results.length).to.equals(2);
        expect(results.roles).to.not.exist();
        results.forEach(user => {
            expect(user).to.be.instanceof(UserModel);
            expect(user.id).to.exists();
            expect(user.username).to.be.a.string();
            expect(user.email).to.be.a.string();
            expect(user.password).to.not.exist();
        });
    });

    it('lists users with offset', async () => {
        // setup
        const criteria = { page: 4, limit: 1 };

        // exercise
        const results = await UserService.list(criteria);

        expect(results).to.be.an.array();
        expect(results.length).to.equals(1);
        expect(results.roles).to.not.exist();
        results.forEach(user => {
            expect(user).to.be.instanceof(UserModel);
            expect(user.id > 3).to.be.true();
            expect(user.username).to.be.a.string();
            expect(user.email).to.be.a.string();
            expect(user.password).to.not.exist();
        });
    });

    it('lists users ordered by column', async () => {
        // setup
        const criteria = { sort: 'username' };

        // exercise
        const results = await UserService.list(criteria);

        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        expect(results.roles).to.not.exist();
        results.forEach(user => {
            expect(user).to.be.instanceof(UserModel);
            expect(user.id).to.exists();
            expect(user.username).to.be.a.string();
            expect(user.email).to.be.a.string();
            expect(user.password).to.not.exists();
        });
    });

    it('lists users order by id descending', async () => {
        // setup
        const criteria = { sort: '-id' };

        // exercise
        const results = await UserService.list(criteria);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(4);
        expect(results.roles).to.not.exists();
        results.forEach((user, index) => {
            expect(user).to.be.instanceof(UserModel);
            expect(user.id).to.exists();
            expect(user.username).to.be.a.string();
            expect(user.email).to.be.a.string();
            expect(user.password).to.not.exists();
            expect(user.id).to.equals(results.length - index);
        });
    });

    it('gets valid user by id', async () => {
        // setup
        const id = 1;
        const user = { username: 'admin', email: 'admin@gmail.com' };

        // exercise
        const result = await UserService.findById(id);

        // validate
        expect(result).to.be.an.object();
        expect(result).to.be.instanceof(UserModel);
        expect(result.id).to.equals(id);
        expect(result.username).to.equals(user.username);
        expect(result.email).to.be.equals(user.email);
        expect(result.password).to.not.exists();
    });

    it('handles getting invalid user by id', async () => {
        // exercise and validate
        await expect(UserService.findById(999)).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('populates role associations when getting user by id', async () => {
        // exercise
        const result = await UserService.findById(1);

        // validate
        expect(result).to.be.instanceof(UserModel);
        expect(result.roles).to.be.an.array();
        expect(result.roles.length).to.equals(3);
        result.roles.forEach(role => {
            expect(role).to.be.instanceof(RoleModel);
            expect(role.id).to.exists();
            expect(role.name).to.be.a.string();
        });
    });

    it('gets valid user by username', async () => {
        // setup
        const user = { id: 1, username: 'admin', email: 'admin@gmail.com' };

        // exercise
        const result = await UserService.findByUserName(user.username);

        // validate
        expect(result).to.be.instanceof(UserModel);
        expect(result.id).to.equals(user.id);
        expect(result.username).to.equals(user.username);
        expect(result.email).to.be.equals(user.email);
        expect(result.password).to.not.exists();
    });

    it('populates role associations when getting user by username', async () => {
        // exercise
        const result = await UserService.findByUserName('admin');

        // validate
        expect(result).to.be.instanceof(UserModel);
        expect(result.roles).to.be.an.array();
        expect(result.roles.length).to.equals(3);
        result.roles.forEach(role => {
            expect(role).to.be.instanceof(RoleModel);
            expect(role.id).to.exists();
            expect(role.name).to.be.a.string();
        });
    });

    it('handles getting invalid user by username', async () => {
        // exercise and validate
        await expect(UserService.findByUserName('invalid')).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('gets valid user by name', async () => {
        // setup
        const user = { id: 1, name: 'Admin User' };

        // exercise
        const results = await UserService.findByName(user.name);

        // validate
        expect(results).to.be.an.array();
        expect(results.length).to.equals(1);
        expect(results[0]).to.be.instanceof(UserModel);
        expect(results[0].roles).to.not.exists();
        expect(results[0].id).to.equals(user.id);
        expect(results[0].name).to.equals(user.name);
        expect(results[0].password).to.not.exists();
    });

    it('gets invalid user by name', async () => {
        // exercise
        const result = await UserService.findByName('invalid');

        // validate
        expect(result).to.be.an.array();
        expect(result).to.be.empty();
    });

    it('gets valid user by email', async () => {
        // setup
        const user = {
            id: 1,
            email: 'admin@gmail.com'
        };

        // exercise
        const result = await UserService.findByEmail(user.email);

        // validate
        expect(result).to.be.instanceof(UserModel);
        expect(result.roles).to.not.exists();
        expect(result.id).to.equals(user.id);
        expect(result.email).to.be.equals(user.email);
        expect(result.password).to.not.exists();
    });

    it('handles geting invalid user by email', async () => {
        // exercise and validate
        await expect(UserService.findByEmail('invalid')).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('authenticates user with valid credentials', async flags => {
        // cleanup
        flags.onCleanup = function() {
            getTokenStub.restore();
        };

        // setup
        const fakeUser = { id: 1, username: 'admin', password: 'admin' };
        const fakeToken = 'fake token';
        const getTokenStub = Sinon.stub(Auth, 'getToken');
        getTokenStub.withArgs({ id: fakeUser.id }).returns(fakeToken);

        // exercise
        const token = await UserService.authenticate(fakeUser.username, fakeUser.password);

        // validate
        expect(token).to.equals(fakeToken);
    });

    it('does not authenticate inactive user', async () => {
        // exercise and validate
        await expect(UserService.authenticate('guest', 'guest')).to.reject(
            Error,
            NSError.AUTH_INVALID_CREDENTIALS().message
        );
    });

    it('does not authenticate invalid username', async () => {
        // exercise and validate
        await expect(UserService.authenticate('invalid', 'admin')).to.reject(
            Error,
            NSError.AUTH_INVALID_CREDENTIALS().message
        );
    });

    it('does not authenticate invalid password', async () => {
        // exercise and validate
        await expect(UserService.authenticate('admin', 'invalid')).to.reject(
            Error,
            NSError.AUTH_INVALID_CREDENTIALS().message
        );
    });

    it('adds a new user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.crypt.restore();
        };

        // setup
        const fakeHash = 'hash';
        const newUser = { username: 'test2', email: 'test2@gmail.com', password: 'test2' };
        cryptStub = Sinon.stub(Auth, 'crypt').resolves(fakeHash);

        // exercise
        const result = await UserService.add(newUser);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(2);
        expect(txSpy.args[0][0]).to.equals(UserModel);
        expect(cryptStub.calledOnce).to.be.true();
        expect(result).to.exists();
        expect(result).to.be.an.instanceof(UserModel);
        expect(result.id).to.exists();
        expect(result.username).to.equals(newUser.username);
        expect(result.email).to.equals(newUser.email);
        expect(result.password).to.exists();
        expect(result.active).to.exists();
        expect(result.active).to.be.false();
        expect(result.password).to.equals(fakeHash);
    });

    it('does not add an existing user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.crypt.restore();
        };

        // setup
        cryptStub = Sinon.stub(Auth, 'crypt').resolves('hash');

        // exercise and validate
        await expect(UserService.add({ username: 'test', email: 'test@gmail.com' })).to.reject(
            Error,
            NSError.RESOURCE_DUPLICATE().message
        );
    });

    it('does not add a user with no password', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.crypt.restore();
        };

        // setup
        cryptStub = Sinon.stub(Auth, 'crypt').rejects(NSError.AUTH_CRYPT_ERROR());

        // exercise and validate
        await expect(UserService.add({ username: 'test', email: 'test@gmail.com' })).to.reject(
            Error,
            NSError.AUTH_CRYPT_ERROR().message
        );
    });

    it('does not add a user with the same email as existing user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.crypt.restore();
        };

        // setup
        cryptStub = Sinon.stub(Auth, 'crypt').resolves('hash');

        // exercise and validate
        await expect(UserService.add({ username: 'test2', email: 'test@gmail.com' })).to.reject(
            Error,
            NSError.RESOURCE_DUPLICATE().message
        );
    });

    it('updates an existing user', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.crypt.restore();
        };

        // setup
        const id = 2;
        const fakeHash = 'hash';
        const user = {
            username: 'test2',
            name: 'test2',
            email: 'test2@gmail.com',
            password: 'test2',
            avatar: 'newavatar',
            active: true
        };
        cryptStub = Sinon.stub(Auth, 'crypt').resolves(fakeHash);

        // exercise
        const result = await UserService.update(id, user);

        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(id);
        expect(txSpy.args[0][0]).to.equals(UserModel);
        expect(cryptStub.calledOnce).to.be.true();
        expect(result).to.be.an.instanceof(UserModel);
        expect(result.id).to.equals(id);
        expect(result.username).to.equals(user.username);
        expect(result.name).to.equals(user.name);
        expect(result.email).to.equals(user.email);
        expect(result.avatar).to.equals(user.avatar);
        expect(result.password).to.equals(fakeHash);
        expect(result.active).to.satisfy(
            value =>
                // accommodate boolean in both sqlite and postgres
                value === true || value === 1
        );
    });

    it('updates an existing user without updating the username', async () => {
        // setup
        const id = 2;
        const user = { email: 'test2@gmail.com', active: true };

        // exercise
        const result = await UserService.update(id, user);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(id);
        expect(txSpy.args[0][0]).to.equals(UserModel);
        expect(result).to.be.an.instanceof(UserModel);
        expect(result.id).to.equals(id);
        expect(result.email).to.equals(user.email);
        expect(result.password).to.exists();
        expect(result.active).to.satisfy(
            value =>
                // accommodate boolean in both sqlite and postgres
                value === true || value === 1
        );
    });

    it('updates an existing user with same username and id as request parameters string', async () => {
        // setup
        const id = 2;
        const user = { username: 'test' };

        // exercise
        const result = await UserService.update(id, user);

        // validate
        expect(txSpy.args[0].length).to.equals(id);
        expect(txSpy.args[0][0]).to.equals(UserModel);
        expect(result).to.be.an.instanceof(UserModel);
        expect(result.id).to.equals(id);
        expect(result.username).to.equals(user.username);
    });

    it('updates an existing user with same username and email', async () => {
        // setup
        const id = 2;
        const user = { username: 'test', email: 'test@gmail.com' };

        // exercise
        const result = await UserService.update(id, user);

        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(id);
        expect(txSpy.args[0][0]).to.equals(UserModel);
        expect(result).to.be.an.instanceof(UserModel);
        expect(result.id).to.equals(id);
        expect(result.username).to.equals(user.username);
        expect(result.email).to.equals(user.email);
        expect(result.password).to.exists();
    });

    it('handles user update with no active property', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.crypt.restore();
        };

        // setup
        const id = 2;
        const fakeHash = 'hash';
        const user = {
            username: 'test2',
            name: 'test2',
            email: 'test2@gmail.com',
            password: 'test2'
        };
        const cryptStub = Sinon.stub(Auth, 'crypt').resolves(fakeHash);

        const result = await UserService.update(id, user);

        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(id);
        expect(txSpy.args[0][0]).to.equals(UserModel);
        expect(cryptStub.calledOnce).to.be.true();
        expect(result).to.be.an.instanceof(UserModel);
        expect(result.id).to.equals(id);
        expect(result.username).to.equals(user.username);
        expect(result.name).to.equals(user.name);
        expect(result.email).to.equals(user.email);
        expect(result.password).to.equals(fakeHash);
        expect(result.active).to.satisfy(
            value =>
                // accommodate boolean in both sqlite and postgres
                value === true || value === 1
        );
    });

    it('handles updating a non existing user', async () => {
        await expect(UserService.update(900, {})).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('does not update a user with same username as existing user', async () => {
        await expect(UserService.update(2, { username: 'admin' })).to.reject(
            Error,
            NSError.RESOURCE_DUPLICATE().message
        );
    });

    it('does not update a user with same email as existing user', async () => {
        await expect(UserService.update(2, { email: 'admin@gmail.com' })).to.reject(
            Error,
            NSError.RESOURCE_DUPLICATE().message
        );
    });

    it('deletes an existing user', async () => {
        // exercise
        const result = await UserService.delete(3);

        // validate
        expect(txSpy.calledOnce).to.be.true();
        expect(txSpy.args[0].length).to.equals(2);
        expect(txSpy.args[0][0]).to.equals(UserModel);
        expect(result).to.not.exist();
    });

    it('handles deleting a non existing user', async () => {
        // exercise and validate
        await expect(UserService.delete(9999)).to.reject(
            Error,
            NSError.RESOURCE_NOT_FOUND().message
        );
    });

    it('does not delete an active user', async () => {
        // exercise and validate
        await expect(UserService.delete(2)).to.reject(Error, NSError.RESOURCE_STATE().message);
    });

    it('sends a password reset email', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Auth.getToken.restore();
            Mailer.sendMail.restore();
        };

        // setup
        const fakeHost = 'localhost';
        const fakeToken = 'fake-token';
        const email = 'admin@gmail.com';
        Sinon.stub(Auth, 'getToken').returns(fakeToken);
        Sinon.stub(Mailer, 'sendMail').callsFake(mail => {
            expect(mail.to).to.equal(email);
            expect(mail.context).to.be.an.object();
            expect(mail.context.url).to.contains(fakeToken);
            return Promise.resolve();
        });

        // exercise
        await UserService.sendPasswordResetEmail(fakeHost, email);

        // validate
        expect(Mailer.sendMail.calledOnce).to.be.true();
        expect(Mailer.sendMail.args[0][0].from).to.equals(Config.mail.address.passwordReset);
        expect(Mailer.sendMail.args[0][0].to).to.equals(email);
        expect(Mailer.sendMail.args[0][0].template).to.equals('password-reset');
        expect(Mailer.sendMail.args[0][0].context).to.be.an.object();
        expect(Mailer.sendMail.args[0][0].context.url).to.be.a.string();
        expect(Mailer.sendMail.args[0][0].context.url).to.startWith(fakeHost);
        expect(URL.parse(Mailer.sendMail.args[0][0].context.url).pathname).to.endWith(
            Config.mail.url.passwordReset
        );
        expect(QS.parse(URL.parse(Mailer.sendMail.args[0][0].context.url).query)).to.include({
            token: fakeToken
        });
    });

    it('handles send password reset email for non existing user', async () => {
        // exercise
        await expect(UserService.sendPasswordResetEmail('localhost', 'invalid@email')).to.reject(
            Error,
            'Email address not found'
        );

        try {
            await UserService.sendPasswordResetEmail('localhost', 'invalid@email');
        } catch (error) {
            expect(error.isBoom).to.be.true();
            expect(error.output.statusCode).to.equals(404);
        }
    });
});
