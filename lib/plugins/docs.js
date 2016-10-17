'use strict';

var Vision = require('vision');
var Inert = require('inert');
var Package = require('../../package.json');

exports.register = function(server, options, next) {

    server.register([Vision, Inert, {
        register: require('lout'),
        options: {
            apiVersion: Package.version
        }
    }], function(err) {

        if (!err) {
            return next();
        }
    });
};

exports.register.attributes = {
    name: 'docs',
    pkg: Package
};
