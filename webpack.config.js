var Path = require('path');
var Glob = require('glob');
var Webpack = require('webpack');
var Config = require('./lib/config');

var internals = {};

// base configuration for development build
internals.baseConfig = {

    // fetches all javascript from client/entries/*, and creates a bundle for each one
    entry: getEntries(),
    module: {
        rules: [{
            // expose jQuery to the global scope as soon as it is required
            test: require.resolve('jquery'),
            use: [{
                loader: 'expose-loader',
                options: 'jQuery'
            }, {
                loader: 'expose-loader',
                options: '$'
            }]
        }, {

            // fool semantic, `this` will point to `window`
            test: /\.js$/,
            include: /semantic/,
            use: ['imports-loader?this=>window']
        }]
    },

    // output all files to assets/js, each one with the name of it's entry file
    output: {
        path: Path.join(__dirname, 'assets/js'),
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js'
    },

    // add development plugins here
    plugins: []
};

// add prod plugins here
internals.prodPlugins = [
    new Webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
    }),
    new Webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
            screw_ie8: true,
            keep_fnames: true
        },
        compress: {
            screw_ie8: true
        },
        comments: false
    })
];

module.exports = buildConfig;

// this is the exported function, that will build the config object based on the NODE_ENV env variable
function buildConfig() {

    var config = internals.baseConfig;

    if (Config.environment === 'production') {
        config.plugins = internals.prodPlugins;
    }

    return config;
}



function getEntries() {

    var entries, config;

    entries = Glob.sync(Path.resolve('./client/entries/**/*.js'));
    config = {};

    entries.forEach(function(file) {

        var name;

        name = Path.basename(file, '.js');
        config[name] = file;
    });

    return config;
}
