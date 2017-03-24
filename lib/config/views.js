'use strict';

var HandleBars = require('handlebars');
var Path = require('path');

var internals = {
    viewsPath: Path.resolve(__dirname, '../../views'),
    partialsPath: Path.resolve(__dirname, '../../views/partials')
};

exports.options = {
    engines: {
        hbs: HandleBars
    },
    isCached: false, // for dev only TODO: it would be nice if this variable was set in the main config file, but requiring it causes a circular dependency issue
    path: internals.viewsPath,
    layout: true,
    partialsPath: internals.partialsPath,
    relativeTo: __dirname
};
