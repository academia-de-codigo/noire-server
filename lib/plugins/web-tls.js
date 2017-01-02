'use strict';

var Package = require('../../package.json');
var WebTls = require('../routes/web-tls');

exports.register = function(server, options, next) {

    server.route(WebTls.endpoints);
    return next();

};

exports.register.attributes = {
    name: 'webTls',
    pkg: Package
};
