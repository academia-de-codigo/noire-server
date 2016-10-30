'use strict';

var Glue = require('glue');
var Exiting = require('exiting');

exports.init = function(manifest, options, next) {

    Glue.compose(manifest, options, function(err, server) {

        if (err) {
            return next(err);
        }

        server.ext('onPreStop', function(server, next) {
            server.log(['server', 'stop']);
            next();
        });

        var exitManager = new Exiting.Manager(server);
        exitManager.start(function(err) {

            return next(err, server);
        });
    });
};
