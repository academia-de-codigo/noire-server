const Path = require('path');
const HandleBars = require('handlebars');
const Config = require('config');

// the default view context present in all views
exports.viewContext = {};

// these helpers will be made available in all views
exports.helpers = {
    // webpack generated bundles to include on the respective page
    scripts: context => `<script src="/js/${context.data.root.view}.js" charset="utf-8"></script>`,
    styles: context => `<link rel="stylesheet" href="/css/${context.data.root.view}.css">`
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
