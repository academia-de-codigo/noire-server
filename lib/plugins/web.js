var Hoek = require('hoek');
var Package = require('../../package.json');
var Web = require('../routes/web');
var ViewsConfig = require('../config/views');

var internals = {};

internals.after = function(server, next) {

    Hoek.assert(ViewsConfig.engines, 'views configuration not found');
    Hoek.assert(Array.isArray(Web.endpoints), 'web route configuration not found');

    server.views(ViewsConfig);
    server.route(Web.endpoints);

    return next();
};

exports.register = function(server, options, next) {

    server.dependency('views', internals.after);
    return next();

};

exports.register.attributes = {
    name: 'web',
    pkg: Package
};
