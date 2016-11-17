'use strict';

var Package = require('../../package.json');
var Api = require('../routes/api');

exports.register = function(server, options, next) {

    server.route(Api.endpoints);
    return next();

};

exports.register.attributes = {
    name: 'api',
    pkg: Package
};
