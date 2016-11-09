'use strict';

var Promise = require('bluebird');
var Error = require('../error');
var Repository = require('../plugins/repository');

exports.list = function() {
    return Repository.role.findAll();
};

exports.findById = function(id) {
    return Repository.role.findOne(id).eager('users').omit(['password']);
};

exports.findByName = function(name) {
    return Repository.role.query().where('name', name);
};

exports.add = function(entity) {

    return Repository.tx(Repository.role.model, function() {

        return exports.findByName(entity.name).then(function(roles) {

            if (roles.length !== 0) {
                return Promise.reject(Error.ROLE_EXISTS);
            }

            return Repository.role.add(entity);
        });
    });
};

exports.delete = function(id) {
    return Repository.role.remove(id);
};
