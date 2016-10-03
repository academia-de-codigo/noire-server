'use strict';

var Glue = require('glue');

exports.init = function(manifest, options, next) {

    Glue.compose(manifest, options, function(err, server) {

        if (err) {
            return next(err);
        }

        server.start(function(err) {

            /*
            //TODO: proper logging with debug support
            server.ext('onRequest', function(request, reply) {

                console.log(request.method.toUpperCase() + ' ' + request.url.path);
                reply.continue();
            });
            */

            return next(err, server);
        });
    });

};
