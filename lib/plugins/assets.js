'use strict';

var Inert = require('inert');
var Package = require('../../package.json');

exports.register = function(server, options, next) {

    server.register(Inert, function(err) {

        if (err) {
            return next(err);
        }

        // Routing for static files
        server.route([

            // Images
            {
                method: 'GET',
                path: '/img/{assetpath*}',
                config: {
                    auth: false,
                    handler: {
                        directory: {
                            path: './assets/img'
                        }
                    }
                }
            },

            // Scripts
            {
                method: 'GET',
                path: '/js/{assetpath*}',
                config: {
                    auth: false,
                    handler: {
                        directory: {
                            path: './assets/js'
                        }
                    }
                }
            },

            // Styles
            {
                method: 'GET',
                path: '/css/{assetpath*}',
                config: {
                    auth: false,
                    handler: {
                        directory: {
                            path: './assets/css'
                        }
                    }
                }
            }
        ]);

        return next();

    });

};

exports.register.attributes = {
    name: 'assets',
    pkg: Package
};
