/**
 * The admin page, possiblt to be implemented as a SPA
 */
'use strict';

var Package = require('../../package.json');

exports.register = function(server, options, next) {

    server.route({
        path: '/',
        method: 'GET',
        config: {
            description: 'the server admin page',
            handler: function(request, reply) {

                var html = '<div>Admin Page</div>';
                return reply(html);
            }
        }
    });

    return next();

};

exports.register.attributes = {
    name: 'admin',
    pkg: Package
};
