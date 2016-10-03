/**
 * Routes restricted to authenticated users, possibly to implement as SPA
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

                var html = '<div>Admin Page to implement as a SPA</div>';
                return reply(html);
            }
        }
    });

    return next();

};

exports.register.attributes = {
    name: 'restricted',
    pkg: Package
};
