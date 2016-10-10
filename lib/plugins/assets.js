'use strict';

var Inert = require('inert');
var Package = require('../../package.json');

exports.register = function(server, options, next) {

    server.register(Inert, function(err) {

        if (err) {
            return next(err);
        }

        // Routing for static files
        server.route([{
            method: 'GET',
            path: '/img/{assetpath*}',
            config: {
                auth: false,
                handler: {
                    directory: {
                        path: './assets/img'
                    }
                },
                app: {
                    redirect: false
                }
            }
        }, {
            method: 'GET',
            path: '/js/{assetpath*}',
            config: {
                auth: false,
                handler: {
                    directory: {
                        path: './assets/js'
                    }
                },
                app: {
                    redirect: false
                }
            }
        }, {
            method: 'GET',
            path: '/css/{assetpath*}',
            config: {
                auth: false,
                handler: {
                    directory: {
                        path: './assets/css'
                    }
                },
                app: {
                    redirect: false
                }
            }
        }, {
            method: 'GET',
            path: '/fonts/{assetpath*}',
            config: {
                auth: false,
                handler: {
                    directory: {
                        path: './assets/fonts'
                    }
                },
                app: {
                    redirect: false
                }
            }
        }]);

        return next();

    });

};

exports.register.attributes = {
    name: 'assets',
    pkg: Package
};
