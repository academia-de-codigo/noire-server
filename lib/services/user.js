'use strict';

var HSError = require('../error');
var Repository = require('../plugins/repository');
var Auth = require('../plugins/auth');

exports.list = function() {
    return Repository.user.findAll().omit(['password']);
};

exports.findById = function(id) {
    return Repository.user.findOne(id).omit(['password']).eager('roles').then(function(user) {

        if (!user) {
            throw HSError.RESOURCE_NOT_FOUND;
        }

        return user;

    });
};

exports.findByName = function(name) {
    return Repository.user.query().where('username', name).omit(['password']);
};

exports.findByEmail = function(email) {
    return Repository.user.query().where('email', email).omit(['password']);
};

exports.authenticate = function(email, password) {

    return Repository.user.query().where('email', email).then(function(users) {

        var user = users[0];

        if (!user) {
            throw HSError.AUTH_INVALID_EMAIL;
        }

        if (user.password !== password) {
            throw HSError.AUTH_INVALID_PASSWORD;
        }

        var token = Auth.getToken(user.id);
        return token;
    });
};
