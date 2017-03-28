var HandleBars = require('handlebars');
var Path = require('path');
var Package = require('../../package.json');
var Config = require('./index');

var internals = {
    viewsPath: Path.resolve(__dirname, '../../views'),
    partialsPath: Path.resolve(__dirname, '../../views/partials')
};

internals.defaultContext = {
    version: Package.version
};

module.exports = {
    engines: {
        hbs: HandleBars
    },
    isCached: Config.cache.views,
    path: internals.viewsPath,
    layout: true,
    partialsPath: internals.partialsPath,
    relativeTo: __dirname,
    context: internals.defaultContext
};
