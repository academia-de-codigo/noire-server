var Webpack = require('./webpack');
var Config = require('./lib/config');

var devOptions, prodOptions;

devOptions = prodOptions = {
    BASE_PATH: __dirname,
    src: {
        path: Config.build.src,
        js: 'src/pages',
        assets: 'assets',
        views: 'views'
    },
    dist: {
        path: Config.build.dist,
        js: 'js',
        assets: Config.build.dist,
        views: 'views'
    },
    names: {
        commons: 'commons' // where should I put this config?
    },
    optimizations: {}
};

module.exports = getConfig;

function getConfig() {

    if (Config.environment === 'production') {
        return Webpack.production(prodOptions);
    } else {
        return Webpack.dev(devOptions);
    }
}
