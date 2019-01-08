/**
 * Contacts Service
 * @module
 */
const Path = require('path');
const Repository = require('plugins/repository');
const NSError = require('errors/nserror');
const Auth = require('plugins/auth');
const Mailer = require('utils/mailer');
const Config = require('config');

/**
 * Signs up a new user by adding its contact
 * and sending a registration email
 * @param {string} host host the server host requesting signup email
 * @param {string} email the user email contact
 */
exports.signup = async function(host, email) {
    // signup is not transactional, not really concerned if we end up with some duplicate contacts
    const user = await Repository.User.query().findOne({ email });

    if (user) {
        throw NSError.RESOURCE_DUPLICATE('Email address already exists');
    }

    // no need to create a new contact if already exists
    let contact = await Repository.Contact.query().findOne({ email });

    if (!contact) {
        contact = await Repository.Contact.add({
            email,
            confirmed: false,
            signupRequests: 0
        });
    }

    if (contact.signupRequests >= Config.mail.maximumSignupRequests) {
        throw NSError.RESOURCE_STATE('Maximum signup requests exceeded');
    }

    const token = await Auth.getToken({ id: contact.id }, Config.auth.signupIn, Auth.token.SIGNUP);

    await Mailer.sendMail({
        from: Config.mail.address.signup,
        to: email,
        subject: 'Noire Server Registration',
        template: 'user-signup',
        context: {
            url: `${Path.join(host, Config.mail.url.signup)}?token=${token}`
        }
    });

    contact.signupRequests++;
    await Repository.Contact.update(contact);
};

/**
 * Register a new user
 * @param {number} id the contact id
 * @param {string} user the user data
 * @returns {User} the registered user entity
 */
exports.register = function(id, user) {
    return Repository.tx(
        [Repository.User.model, Repository.Contact.model],
        async (txUserRepository, txContactRepository) => {
            // make sure we have a contact in a valid state
            const contact = await txContactRepository.findOne(id);

            if (!contact || contact.email !== user.email) {
                throw NSError.AUTH_UNAUTHORIZED('Invalid email address');
            }

            if (contact.confirmed) {
                throw NSError.AUTH_UNAUTHORIZED('User already exists');
            }

            const getHash = Auth.crypt(user.password);
            const getEqualUsers = txUserRepository
                .query()
                .where('username', user.username)
                .orWhere('email', user.email);

            // concurrently calculate password hash and look for existing users
            const [equalUsers, hash] = await Promise.all([getEqualUsers, getHash]);

            if (equalUsers.length !== 0) {
                throw NSError.RESOURCE_DUPLICATE('User already exists');
            }

            user.password = hash;
            user.active = true;
            user.avatar = Config.users.avatar;
            contact.confirmed = true;

            // concurrently update contact and persist new user
            const [savedUser] = await Promise.all([
                txUserRepository.add(user),
                txContactRepository.update(contact)
            ]);

            return savedUser;
        }
    );
};

/**
 * Retrieves all contacts
 * @param {(number|string|Object)} [criteria] search criteria
 * @returns {Promise<User[]>} all retrieved contacts
 */
exports.list = function(criteria) {
    return Repository.Contact.findAll(criteria);
};

/**
 * Retrieves a contact by its id
 * @async
 * @param {number} id the contact id
 * @returns {Promise<User>} the retrieved contact
 */
exports.findById = async function(id) {
    const contact = await Repository.Contact.findOne(id);

    if (!contact) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    return contact;
};

/**
 * Removes a contact
 * @param {number} id the contact id
 * @returns {Promise} resolved if the transaction was committed with success
 */
exports.delete = function(id) {
    return Repository.tx(Repository.Contact.model, async txContactRepository => {
        const contact = await txContactRepository.findOne(id);

        if (!contact) {
            throw NSError.RESOURCE_NOT_FOUND();
        }

        const count = await txContactRepository.remove(id);

        if (count !== 1) {
            throw NSError.RESOURCE_DELETE();
        }

        return;
    });
};

/**
 * Counts the number of contacts
 * @async
 * @param {Object} [criteria] search criteria
 * @returns {Promise<number>} the number of contacts
 */
exports.count = async function(criteria) {
    return (await Repository.Contact.count(criteria)).count;
};
