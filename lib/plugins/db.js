'use strict';

var Objection = require('objection');
var Package = require('../../package.json');
var Config = require('../config');


exports.register = function(server, options, next) {


    var knex = require('knex')(Config.db);
    var Model = Objection.Model;

    Model.knex(knex);

    server.decorate('server', 'dbQuery', knex);
    server.decorate('server', 'dbModel', Model);

    server.log(['server', 'db', 'start'], Config.db);
    return next();

};

exports.register.attributes = {
    name: 'db',
    pkg: Package
};
