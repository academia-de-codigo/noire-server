'use strict';

var Path = require('path');
var HandleBars = require('handlebars');
var Config = require('../config');
var Package = require('../../package.json');
var Web = require('../routes/web');

var internals = {
    viewsPath: Path.resolve(__dirname, '../../views'),
    partialsPath: Path.resolve(__dirname, '../../views/partials')
};

exports.register = function(server, options, next) {

    server.dependency(['auth', 'vision'], internals.after);
    return next();

};

internals.after = function(server, next) {

    server.views({
        engines: {
            hbs: HandleBars
        },
        isCached: Config.cache.views.isCached,
        path: internals.viewsPath,
        partialsPath: internals.partialsPath,
        relativeTo: __dirname
    });

    server.route(Web.endpoints);
    return next();

};

exports.register.attributes = {
    name: 'web',
    pkg: Package
};
