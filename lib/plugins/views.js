var Package = require('../../package.json');
var Vision = require('vision');

exports.register = function(server, options, next) {

    server.register(Vision, function(err) {

        if (err) {
            return next(err);
        }

        // insert logged in user data into every view context
        server.ext('onPreResponse', function(request, reply) {

            var response = request.response;
            if (response.variety && response.variety === 'view') {
                response.source.context = response.source.context || {};
                response.source.context.user = request.auth.isAuthenticated ? request.auth.credentials : null;
            }
            return reply.continue();
        });

        return next();
    });
};

exports.register.attributes = {
    name: 'views',
    pkg: Package
};
