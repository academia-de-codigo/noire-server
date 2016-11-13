'use strict';

var Promise = require('bluebird');
var HSError = require('../../lib/error');
var Users = require('../../lib/users.json');

var internals = {};
internals.users = Users;

// created using npm run token
internals.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNDc4OTk1ODEyLCJleHAiOjE0NzkwMjQ2MTJ9.Jed6SqmlRYfPTwEWEvb3B73Q9AkFekpbXYi0nkHREgo';

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

    return exports.findByEmail(email).then(function(user) {

        if (!user) {
            return Promise.reject(HSError.AUTH_INVALID_EMAIL);
        }

        if (user.password !== password) {
            return Promise.reject(HSError.AUTH_INVALID_PASSWORD);
        }

        return Promise.resolve(internals.token);
    }).catch(function(err) {

        if (err === HSError.AUTH_INVALID_PASSWORD) {
            return Promise.reject(err);
        }

        return Promise.reject(HSError.AUTH_INVALID_EMAIL);
    });
};
