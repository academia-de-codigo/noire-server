var HandleBars = require('handlebars');
var Path = require('path');
var Package = require('../../package.json');
var Config = require('./index');

var internals = {
    viewsPath: Path.join(__dirname, '../../views'),
    partialsPath: Path.join(__dirname, '../../views/partials')
};

internals.defaultContext = {
    version: Package.version
};

exports.context = {
    default: internals.defaultContext,
    variables: {
        CREDENTIALS: 'credentials',
        PAGE_NAME: 'page-name'
    }
};

exports.manager = {
    engines: {
        hbs: HandleBars
    },
    isCached: Config.cache.views,
    path: internals.viewsPath,
    layout: true,
    partialsPath: internals.partialsPath,
    relativeTo: __dirname,
    context: exports.context.default
};
