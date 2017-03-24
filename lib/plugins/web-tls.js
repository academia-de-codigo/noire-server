var Package = require('../../package.json');
var WebTls = require('../routes/web-tls');
var Config = require('../config');

var internals = {};

internals.after = function(server, next) {

    server.views(Config.views.options);
    server.route(WebTls.endpoints);

    return next();
};

exports.register = function(server, options, next) {

    server.dependency('views', internals.after);
    return next();

};

exports.register.attributes = {
    name: 'webTls',
    pkg: Package
};
