var HandleBars = require('handlebars');
var Path = require('path');
var Config = require('./index');

var internals = {
    viewsPath: Path.resolve(__dirname, '../../views'),
    partialsPath: Path.resolve(__dirname, '../../views/partials')
};

exports.options = {
    engines: {
        hbs: HandleBars
    },
    isCached: Config.cache.views,
    path: internals.viewsPath,
    layout: true,
    partialsPath: internals.partialsPath,
    relativeTo: __dirname
};
