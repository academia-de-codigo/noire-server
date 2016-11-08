'use strict';

var Repository = require('../repository');

exports.list = function() {
    return Repository.role.findAll();
};

exports.findByName = function(name) {
    return Repository.role.query().where('name', name);
};
