var Package = require('../../package.json');
var Vision = require('vision');

exports.register = function(server, options, next) {

    server.register(Vision, function(err) {

        if (err) {
            return next(err);
        }

        return next();
    });
};

exports.register.attributes = {
    name: 'views',
    pkg: Package
};
