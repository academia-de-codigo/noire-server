var HandleBars = require('handlebars');
var Path = require('path');
var Package = require('../../package.json');
var WebpackConfig = require('../../webpack.config').options;
var Config = require('./index');

var internals = {};


internals.defaultContext = {
    version: Package.version
};

exports.dist = {
    path: Path.join(WebpackConfig.output.path, WebpackConfig.output.views),
    pages: Path.join(WebpackConfig.output.path, WebpackConfig.output.views, WebpackConfig.views.pages),
    partials: Path.join(WebpackConfig.output.path, WebpackConfig.output.views, WebpackConfig.views.partials)
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
    path: exports.dist.path,
    partialsPath: exports.dist.partials,
    relativeTo: __dirname,
    context: exports.context.default
};
