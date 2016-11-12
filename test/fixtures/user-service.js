'use strict';

var Promise = require('bluebird');
var HSError = require('../../lib/error');
var Users = require('../../lib/users.json');

var internals = {};
internals.users = Users;

exports.setUsers = function(users) {
    internals.users = users;
};

exports.findById = function(id) {
    var user = internals.users.find(function(user) {
        return user.id === id;
    });

    if (!user) {
        return Promise.reject(HSError.RESOURCE_NOT_FOUND);
    }

    return Promise.resolve(user);
};

exports.findByEmail = function(email) {
    var user = internals.users.find(function(user) {
        return user.email === email;
    });

    if (!user) {
        return Promise.reject(HSError.RESOURCE_NOT_FOUND);
    }

    return Promise.resolve(user);
};

exports.list = function() {
    return Promise.resolve(internals.users);
};

exports.authenticate = function(email, password) {
    var user = exports.findByEmail(email);

    if (!user) {
        return Promise.reject(HSError.AUTH_INVALID_EMAIL);
    }

    if (user.password !== password) {
        return Promise.reject(HSError.AUTH_INVALID_PASSWORD);
    }

    return Promise.accept('token');
};
