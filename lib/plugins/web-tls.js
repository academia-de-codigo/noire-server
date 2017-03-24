'use strict';

var Package = require('../../package.json');
var WebTls = require('../routes/web-tls');
var Config = require('../config');

var internals = {};

exports.register = function(server, options, next) {

    server.dependency(['auth', 'vision'], internals.after);
    return next();

};

internals.after = function(server, next) {

    server.views(Config.views.options);
    server.route(WebTls.endpoints);

    return next();
};

exports.register.attributes = {
    name: 'webTls',
    pkg: Package
};
