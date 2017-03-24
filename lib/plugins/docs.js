var Lout = require('Lout');
var Package = require('../../package.json');

exports.register = function(server, options, next) {

    server.dependency(['views', 'assets']);

    server.register({
        register: Lout,
        options: {
            apiVersion: Package.version
        }
    }, function(err) {

        if (err) {
            return next(err);
        }

        return next();
    });
};

exports.register.attributes = {
    name: 'docs',
    pkg: Package
};
