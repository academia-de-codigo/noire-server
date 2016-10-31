'use strict';

var Glue = require('glue');
var Exiting = require('exiting');

var internals = {};

exports.start = function(manifest, options, next) {

    Glue.compose(manifest, options, function(err, server) {

        if (err) {
            return next(err);
        }

        internals.manager = new Exiting.Manager(server);
        internals.manager.start(function(err) {
            return next(err, server);
        });
    });
};

exports.stop = function(next) {

    internals.manager.stop(function(err) {

        Exiting.reset();

        if (err) {
            return next(err);
        }

        return next();
    });
};
