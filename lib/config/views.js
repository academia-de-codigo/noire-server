const HandleBars = require('handlebars');
const Path = require('path');
const Package = require('../../package.json');
const WebpackConfig = require('../../webpack.config').options;
const Config = require('./index');

const internals = {};

internals.defaultContext = {
    version: Package.version
};

exports.dist = {
    path: Path.join(WebpackConfig.paths.output.path, WebpackConfig.paths.output.views),
    pages: Path.join(WebpackConfig.paths.output.path, WebpackConfig.paths.output.views, WebpackConfig.paths.views.pages),
    partials: Path.join(WebpackConfig.paths.output.path, WebpackConfig.paths.output.views, WebpackConfig.paths.views.partials)
};

exports.context = {
    default: internals.defaultContext,
    variables: {
        CREDENTIALS: 'credentials',
        VIEW: 'view'
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
