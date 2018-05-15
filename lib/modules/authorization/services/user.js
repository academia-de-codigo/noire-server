/**
 * User Service
 * @module
 */
const Hoek = require('hoek');
const NSError = require('errors/nserror');
const Repository = require('plugins/repository');
const Auth = require('plugins/auth');
const Mailer = require('utils/mailer');
const Config = require('config');

/**
 * Counts the number of users
 * @async
 * @param {Object} [criteria] search criteria
 * @returns {Promise<number>} the number of users
 */
exports.count = async function(criteria) {
    return (await Repository.user.count(criteria)).count;
};

/**
 * Retrieves all users
 * @param {(number|string|Object)} [criteria] search criteria
 * @returns {Promise<User[]>} all retrieved users
 */
exports.list = function(criteria) {
    return Repository.user.findAll(criteria).omit(['password']);
};

/**
 * Retrieves a user by its id
 * @async
 * @param {number} id the user id
 * @returns {Promise<User>} the retrieved user
 */
exports.findById = async function(id) {
    const user = await Repository.user
        .findOne(id)
        .omit(['password'])
        .eager('roles');

    if (!user) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    return user;
};

/**
 * Retrieves a user by its username
 * @async
 * @param {string} username the username
 * @returns {Promise<User>} the retrieved user
 */
exports.findByUserName = async function(username) {
    const user = await Repository.user
        .query()
        .findOne({ username })
        .omit(['password'])
        .eager('roles');

    if (!user) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    return user;
};

/**
 * Retrieves user entities by name
 * @param {string} name the name of the user
 * @returns {Promise<User[]>} the retrieved users
 */
exports.findByName = function(name) {
    // same name can exist on multiple users
    return Repository.user
        .query()
        .where('name', name)
        .omit(['password']);
};

/**
 * Retrieves a user by its email
 * @async
 * @param {string} email the user email
 * @returns {Promise<User>} the retrieved user
 */
exports.findByEmail = async function(email) {
    const user = await Repository.user
        .query()
        .findOne({ email })
        .omit(['password']);

    if (!user) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    return user;
};

/**
 * Saves a user
 * @param {User} entity the user to save
 * @returns {Promise<User>} the added user
 */
exports.add = function(entity) {
    return Repository.tx(Repository.user.model, async txUserRepository => {
        const getHash = Auth.crypt(entity.password);
        const getEqualUsers = txUserRepository
            .query()
            .where('username', entity.username)
            .orWhere('email', entity.email);

        const [equalUsers, hash] = await Promise.all([getEqualUsers, getHash]);

        if (equalUsers.length !== 0) {
            throw NSError.RESOURCE_DUPLICATE();
        }

        entity.password = hash;
        entity.active = false;

        return txUserRepository.add(entity);
    });
};

/**
 * Updates an existing user
 * @param {number} id the id of the user to update
 * @param {User} entity the user to update
 * @returns {Promise<User>} the updated user
 */
exports.update = function(id, entity) {
    return Repository.tx(Repository.user.model, async txUserRepository => {
        const getUserByID = txUserRepository.findOne(id);
        const getEqualUsers =
            entity.username || entity.email
                ? txUserRepository
                      .query()
                      .skipUndefined()
                      .where('username', entity.username)
                      .orWhere('email', entity.email)
                : Promise.resolve([]);

        const [user, equalUsers] = await Promise.all([getUserByID, getEqualUsers]);

        if (!user) {
            throw NSError.RESOURCE_NOT_FOUND();
        }

        // username or email is already taken, we should not update
        if (equalUsers.length > 0 && equalUsers[0].id !== id) {
            throw NSError.RESOURCE_DUPLICATE();
        }

        const fields = ['username', 'name', 'email', 'avatar', 'active'];
        Hoek.merge(user, Hoek.cloneWithShallow(entity, fields));

        if (entity.password) {
            user.password = await Auth.crypt(entity.password);
        }

        return txUserRepository.update(user);
    });
};

/**
 * Authenticates a user
 * @async
 * @param {string} username the user username
 * @param {string} password the user password
 * @param {boolean|number|string} expiresIn expressed in seconds or a string describing a time span or false if token never expires
 * @returns {Promise<string>} the authentication token
 */
exports.authenticate = async function(username, password, expiresIn) {
    const user = await Repository.user.query().findOne({ username });

    if (!user || !user.active) {
        throw NSError.AUTH_INVALID_USERNAME();
    }

    const result = await Auth.compare(password, user.password);

    if (!result) {
        throw NSError.AUTH_INVALID_PASSWORD();
    }

    return Auth.getToken({ id: user.id }, expiresIn);
};

/**
 * Removes a user
 * @param {number} id the user id
 * @returns {Promise} resolved if the transaction was committed with success
 */
exports.delete = function(id) {
    return Repository.tx(Repository.user.model, async txUserRepository => {
        const user = await txUserRepository.findOne(id);

        if (!user) {
            throw NSError.RESOURCE_NOT_FOUND();
        }

        if (user.active) {
            throw NSError.RESOURCE_STATE();
        }

        const count = await txUserRepository.remove(id);

        if (count !== 1) {
            throw NSError.RESOURCE_DELETE();
        }

        return;
    });
};

/**
 * Sends a password reset email
 * @param {string} email the user email address
 */
exports.sendPasswordResetEmail = async function(email) {
    // look for active user, if disabled can not reset password
    const user = await Repository.user.query().findOne({ email, active: true });

    if (!user) {
        throw NSError.RESOURCE_NOT_FOUND('Email address not found');
    }

    const token = await Auth.getToken(
        { id: user.id },
        Config.auth.passwordResetIn,
        Auth.token.PASSWORD_RESET
    );

    await Mailer.sendMail({
        from: Config.mail.address.passwordReset,
        to: email,
        subject: 'Noire Server Password Reset',
        template: 'password-reset',
        context: {
            url: `${Config.mail.url.passwordReset}?token=${token}`
        }
    });
};
