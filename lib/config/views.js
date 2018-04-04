const HandleBars = require('handlebars');
const Path = require('path');
const Config = require('./index');
const WebpackConfig = require(Path.join(process.cwd(), 'webpack.config')).options;

// the default view context present in all views
exports.viewContext = {};

exports.dist = {
    path: Path.join(WebpackConfig.paths.output.path, WebpackConfig.paths.output.views),
    pages: Path.join(WebpackConfig.paths.output.path, WebpackConfig.paths.output.views, WebpackConfig.paths.views.pages),
    partials: Path.join(WebpackConfig.paths.output.path, WebpackConfig.paths.output.views, WebpackConfig.paths.views.partials)
};

exports.contextVariables = {
    VERSION: 'version',
    CREDENTIALS: 'credentials',
    VIEW: 'view'
};

exports.options = {
    engines: {
        hbs: HandleBars
    },
    isCached: Config.cache.views,
    path: exports.dist.path,
    partialsPath: exports.dist.partials,
    context: exports.viewContext
};
