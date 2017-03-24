/**
 * Secure web/web-tls routes against CSRF
 */
var Crumb = require('crumb');
var Package = require('../../package.json');

exports.register = function(server, options, next) {

    var config = {
        restful: true, // all POST, PUT, DELETE, OR PATCH requests require a valid crumb to be loaded in headers
        cookieOptions: {
            isSecure: true // cookie is not allowed to be transmitted over insecure connections
        }
    };

    server.register({
        register: Crumb,
        options: config
    }, function(err) {

        if (err) {
            return next(err);
        }

        // route returning a valid crumb
        server.route({
            method: 'GET',
            path: '/generate',
            config: {
                auth: false,
                description: 'Get crumb to start session.',
                handler: function(request, reply) {

                    return reply({
                        crumb: request.plugins.crumb
                    });
                }
            }
        });

        return next();
    });

};

exports.register.attributes = {
    name: 'csrf',
    pkg: Package
};
