var Lout = require('lout');
var Package = require('../../package.json');

exports.register = function(server, options, next) {

    server.dependency('views');

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
