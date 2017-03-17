'use strict';

exports.get = {
    description: 'Returns the admin section',
    auth: {
        scope: 'admin'
    },
    handler: function(request, reply) {

        return reply.view('pages/admin', {
            user: request.auth.credentials,
        });
    }
};
