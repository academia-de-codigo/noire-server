var Webpack = require('./webpack');
var Path = require('path');

var internals = {};
internals.production = process.env.NODE_ENV === 'production';

module.exports = build;

internals.basePath = Path.join(__dirname, 'client');
internals.srcPath = 'src';
internals.outputPath = 'dist';

internals.src = {
    path: Path.join(internals.basePath, internals.srcPath),
    entryPoints: 'js/pages',
    assets: 'assets',
    views: 'views',
};

internals.output = {
    path: Path.join(internals.basePath, internals.outputPath),
    js: 'js',
    views: 'views',
    css: 'css',
    img: 'img',
    fonts: 'fonts'
};

internals.assets = {
    css: 'css',
    fonts: 'fonts',
    img: 'img'
};

internals.views = {
    pages: 'pages',
    partials: 'partials',
    layout: 'layout.hbs'
};

internals.options = {
    plugins: {
        commons: {
            filename: 'commons'
        }
    },
    paths: {
        base: internals.basePath,
        src: internals.src,
        output: internals.output,
        views: internals.views,
        assets: internals.assets
    }
};

module.exports.options = internals.options;

function build() {
    if (internals.production) {
        return Webpack.production(internals.options, module.exports.paths);
    } else {
        return Webpack.dev(internals.options, module.exports.paths);
    }
}
