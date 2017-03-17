'use strict';

var Package = require('../../../package.json');

// GET /home
exports.get = {
    description: 'Returns the home page',
    auth: {
        mode: 'try'
    },
    //TODO: move code into home controller, unit test
    handler: function(request, reply) {

        var user = null;
        if (request.auth.isAuthenticated) {
            user = request.auth.credentials;

            if (user.scope.indexOf('admin') !== -1) {
                user.admin = true;
            }
        }

        return reply.view('pages/home', {
            version: Package.version,
            user: user
        });
    }
};
