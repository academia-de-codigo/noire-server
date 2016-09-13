'use strict';

var Hapi = require('hapi');
var Version = require('./version');
var Admin = require('./admin');
var Auth = require('./auth');

exports.init = function(port, next) {

    var server = new Hapi.Server();
    server.connection({
        port: port
    });

    server.register([Auth, Version, Admin], function(err) {

        if (err) {
            return next(err);
        }

        server.start(function(err) {

            return next(err, server);
        });
    });

};
