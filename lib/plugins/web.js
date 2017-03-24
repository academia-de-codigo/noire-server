var Package = require('../../package.json');
var Web = require('../routes/web');
var Config = require('../config');

var internals = {};

exports.register = function(server, options, next) {

    server.dependency(['auth', 'vision'], internals.after);
    return next();

};

internals.after = function(server, next) {

    server.views(Config.views.options);
    server.route(Web.endpoints);

    return next();
};

exports.register.attributes = {
    name: 'web',
    pkg: Package
};
