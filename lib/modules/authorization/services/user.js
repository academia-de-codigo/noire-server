/**
 * User Service
 * @module
 */
const Path = require('path');
const NSError = require(Path.join(process.cwd(), 'lib/errors/nserror'));
const Repository = require(Path.join(process.cwd(), 'lib/plugins/repository'));
const Auth = require(Path.join(process.cwd(), 'lib/plugins/auth'));

const internals = {};

internals.findAllBySearchCriteria = function(criteria) {
    return Repository.user.findAll(criteria).omit(['password'])
        .where('username', 'like', '%' + criteria.search + '%')
        .orWhere('name', 'like', '%' + criteria.search + '%')
        .orWhere('email', 'like', '%' + criteria.search + '%');
};

internals.countBySearchCriteria = async function(criteria) {
    // all criteria is ignored except search
    const result = await Repository.user.query().count('* as count')
        .from(internals.findAllBySearchCriteria({ search: criteria.search }).as('ignored_alias'));

    return result[0].count;
};

internals.countAll = async function() {
    const result = Repository.user.query().count('* as count');
    return result[0].count;
};

/**
 * Counts the number of users
 * @async
 * @param {Object} [criteria] search criteria
 * @returns {Promise<number>} the number of users
 */
exports.count = function(criteria) {
    return criteria && criteria.search ? internals.countBySearchCriteria(criteria) : internals.countAll();
};

/**
 * Retreives all users
 * @param {(number|string|Object)} [criteria] search criteria
 * @returns {Promise<User[]>} all retreived users
 */
exports.list = function(criteria) {

    if (criteria && criteria.search) {
        return internals.findAllBySearchCriteria(criteria);
    }

    return Repository.user.findAll(criteria).omit(['password']);
};

/**
 * Retreives a user by its id
 * @async
 * @param {number} id the user id
 * @returns {Promise<User>} the retreived user
 */
exports.findById = async function(id) {

    const user = await Repository.user.findOne(id).omit(['password']).eager('roles');

    if (!user) {
        throw NSError.RESOURCE_NOT_FOUND;
    }

    return user;
};

/**
 * Retreives a user by its username
 * @async
 * @param {string} username the username
 * @returns {Promise<User>} the retreived user
 */
exports.findByUserName = async function(username) {

    const user = await Repository.user.findOne({ username }).omit(['password']);

    if (!user) {
        throw NSError.RESOURCE_NOT_FOUND;
    }

    return user;
};

/**
 * Retreives user entities by name
 * @param {string} name the name of the user
 * @returns {Promise<User[]>} the retreived users
 */
exports.findByName = function(name) {
    return Repository.user.query().where('name', name).omit(['password']);
};

/**
 * Retreives a user by its email
 * @async
 * @param {string} email the user email
 * @returns {Promise<User>} the retreived user
 */
exports.findByEmail = async function(email) {

    const user = await Repository.user.findOne({ email }).omit(['password']);

    if (!user) {
        throw NSError.RESOURCE_NOT_FOUND;
    }

    return user;
};

/**
 * Saves a user
 * @async
 * @param {User} entity the user to save
 * @returns {Promise} resolved if the transaction was commited with success
 */
exports.add = function(entity) {

    // transaction protects against duplicates caused by simultaneous add
    return Repository.tx(Repository.user.model, async txUserRepository => {

        const getHash = Auth.crypt(entity.password);
        const getDuplicateUsers = txUserRepository.query().where('username', entity.username).orWhere('email', entity.email);

        const results = await Promise.all(getDuplicateUsers, getHash);
        const users = results[0];
        const hash = results[1];

        if (users.length !== 0) {
            throw NSError.RESOURCE_DUPLICATE;
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
 * @returns {Promise} resolved if the transaction was commited with success
 */
exports.update = function(id, entity) {

    return Repository.tx(Repository.user.model, async txUserRepository => {

        const getUserByID = txUserRepository.findOne(id);
        const getDuplicateUsers = txUserRepository.query().skipUndefined()
            .where('username', entity.username).orWhere('email', entity.email);

        const results = await Promise.all(getUserByID, getDuplicateUsers);
        const user = results[0];
        const duplicateUsers = results[1];

        if (!user) {
            throw NSError.RESOURCE_NOT_FOUND;
        }

        if (duplicateUsers.length > 0 && duplicateUsers[0].id !== Number.parseInt(id)) {
            throw NSError.RESOURCE_DUPLICATE;
        }

        user.username = entity.username || user.username;
        user.name = entity.name || user.name;
        user.email = entity.email || user.email;

        // need to explicitely test for active boolean presence
        if (entity.active !== undefined) {
            user.active = entity.active;
        }

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
 * @returns {Promise<string>} the authentication token
 */
exports.authenticate = async function(username, password) {

    const users = await Repository.user.query().where('username', username);
    const user = users[0];

    if (!user || !user.active) {
        throw NSError.AUTH_INVALID_USERNAME;
    }

    const result = await Auth.compare(password, user.password);

    if (!result) {
        throw NSError.AUTH_INVALID_PASSWORD;
    }

    return Auth.getToken(user.id);
};

/**
 * Removes a user
 * @param {number} id the user id
 * @returns {Promise} resolved if the transaction was commited with success
 */
exports.delete = function(id) {

    return Repository.tx(Repository.user.model, async txUserRepository => {

        const user = await txUserRepository.findOne(id);

        if (!user) {
            throw NSError.RESOURCE_NOT_FOUND;
        }

        if (user.active) {
            throw NSError.RESOURCE_STATE;
        }

        const count = await txUserRepository.remove(id);

        if (count !== 1) {
            throw NSError.RESOURCE_DELETE;
        }

        return;
    });
};
