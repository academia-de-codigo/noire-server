var Hoek = require('hoek');
var Package = require('../../package.json');
var WebTls = require('../routes/web-tls');
var ViewsConfig = require('../config/views');

var internals = {};

internals.after = function(server, next) {

    Hoek.assert(ViewsConfig.engines, 'views configuration not found');
    Hoek.assert(Array.isArray(WebTls.endpoints), 'webTls route configuration not found');

    server.views(ViewsConfig);
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
