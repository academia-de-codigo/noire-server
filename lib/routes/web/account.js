'use strict';

exports.get = {
    description: 'Returns the user account page',
    auth: {
        scope: 'user'
    },
    handler: function(request, reply) {

        return reply.view('account', {
            user: request.auth.credentials
        });
    }
};
