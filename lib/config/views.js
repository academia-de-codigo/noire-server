const Path = require('path');
const HandleBars = require('handlebars');
const Config = require('./index');

// the default view context present in all views
exports.viewContext = {};

// these helpers will be made available in all views
exports.helpers = {
    // webpack generated bundle to include on the respective page
    bundle: context =>
        `<script src="/js/${context.data.root.view}.bundle.js" charset="utf-8"></script>`
};

// context variables to be inserted in the view context
exports.contextVariables = {
    VERSION: 'version',
    CREDENTIALS: 'credentials',
    VIEW: 'view'
};

// view configuration options
exports.options = {
    engines: {
        hbs: HandleBars
    },
    isCached: Config.cache.views,
    layout: true,
    layoutPath: Path.join(Config.build.dist, 'views'),
    path: Path.join(Config.build.dist, 'views'),
    partialsPath: Path.join(Config.build.dist, 'views/partials'),
    context: exports.viewContext
};
