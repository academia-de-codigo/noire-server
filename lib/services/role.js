'use strict';

var Promise = require('bluebird');

var Repository = require('../repository');

exports.list = function() {
    return Repository.role.findAll();
};

exports.findById = function(id) {
    return Repository.role.findOne(id);
};

exports.findByName = function(name) {
    return Repository.role.query().where('name', name);
};

exports.add = function(name) {

    //TODO get this inside transaction?
    exports.findByName(name).then(function(roles) {

        if (roles.length === 0) {
            return Promise.reject('role already exists');
        }

        return Repository.role.add({
            name: name
        });
    });
};

exports.delete = function(id) {
    return Repository.role.remove(id);
};
