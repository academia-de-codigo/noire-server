var Path = require('path');
var Glob = require('glob');
var Webpack = require('webpack');
var CommonsChunkPlugin = Webpack.optimize.CommonsChunkPlugin;
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var Config = require('./lib/config');
var internals = {};

// TODO: make all paths come from Config file.. (DIST_PATH/img/, etc...)
var SRC_PATH = Config.build.src;
var DIST_PATH = Config.build.dist;

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
        }, {
            // required css in javascript files will be injected in a script tag to load asynchronously
            // if ExtractTextPlugin isn't available, use style loader, which injects css inline with JS (not async)
            // the resulting CSS will be written in /assets/css/[pagename].css (check plugin config below)
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [{
                    loader: 'css-loader',
                    options: {
                        minimize: Config.environment === 'production' ? true : false
                    }
                }]
            })
        }, {
            // files required by css (using url()) will live as files inside their own folders
            // this is required for css-loader to work

            // pictures will live inside /assets/img/ folder
            test: /\.(png|jpg|gif|svg)$/,
            loader: 'url-loader',
            options: {
                // public path prepends '../' where this file is required
                // css file lives inside client/src/css/ and images in client/assets/img/, so it has to go up two levels
                // (e.g. require('../img/asset.png'))
                publicPath: '../img/',
                name: '[name].[ext]',
                outputPath: './img/',
                limit: 10000 // TODO: investigate this.. does not build the files with this option off
            }
        }, {

            // fonts will live inside /assets/fonts/
            test: /\.(eot|ttf|woff|woff2)$/,
            loader: 'url-loader',
            options: {
                publicPath: '/fonts/',
                name: '[name].[ext]',
                outputPath: './fonts/',
                limit: 10000
            }
        }],
    },

    // output all files to assets, each one with the name of it's entry file
    output: {
        path: Path.join(__dirname, DIST_PATH),
        filename: Path.join('js', '[name].bundle.js'),
        chunkFilename: Path.join('js', '[id].chunk.js') // TODO: investigate this too
    },

    // add development/production plugins here
    plugins: [
        new CommonsChunkPlugin({
            name: 'commons',
        }),
        // the plugin that extracts all CSS required in JS into a bundled css file
        new ExtractTextPlugin('./css/[name].css'),

        // TODO: one image gets copied twice because it is already required in one of the css files.. please recheck this later
        new CopyWebpackPlugin([{
            from: Path.join(__dirname, SRC_PATH, 'assets'),
            to: Path.join(__dirname, DIST_PATH)
        }])
    ]
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
        config.plugins = config.plugins.concat(internals.prodPlugins);
    }

    return config;
}



function getEntries() {

    var fileList, entries;

    fileList = Glob.sync(Path.join(__dirname, SRC_PATH, 'src/pages/**/*.js'));
    entries = {};

    fileList.forEach(function(file) {

        var name;

        name = Path.basename(file, '.js');
        entries[name] = file;
    });


    return entries;
}
