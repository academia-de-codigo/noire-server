/**
 * Contacts Service
 * @module
 */
const Repository = require('plugins/repository');
const NSError = require('errors/nserror');
const Auth = require('plugins/auth');
const Mailer = require('utils/mailer');
const Config = require('config');

/**
 * Signs up a new user by adding its contact
 * and sending a registration email
 * @param {string} email the user email contact
 */
exports.signup = async function(email) {
    // signup is not transactional, not really concerned if we end up with some duplicate contacts
    const user = await Repository.user.query().findOne({ email });

    if (user) {
        throw NSError.RESOURCE_DUPLICATE('Email address already exists');
    }

    // no need to create a new contact if already exists
    let contact = await Repository.contact.query().findOne({ email });

    if (!contact) {
        contact = await Repository.contact.add({ email, confirmed: false });
    }

    const token = await Auth.getToken({ id: contact.id }, Config.auth.signupIn, Auth.token.SIGNUP);

    await Mailer.sendMail({
        from: Config.mail.address.signup,
        to: email,
        subject: 'Noire Server Registration',
        template: 'user-signup',
        context: {
            url: `${Config.mail.url.signup}?token=${token}`
        }
    });
};

/**
 * Register a new user
 * @param {number} id the contact id
 * @param {string} user the user data
 */
exports.register = function(id, user) {
    return Repository.tx(
        Repository.user.model,
        Repository.contact.model,
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
