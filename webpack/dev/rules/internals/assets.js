var ExtractTextPlugin = require('extract-text-webpack-plugin');

var rules = {};

module.exports = rules;

// extracts CSS inlined in the JS bundles to separate files
// the created file options (including name and location) are set on the plugins section
rules.extractCSS = function(options) {
    return {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader', // if the plugin is not available, fallbacks to the normal behaviour (inline CSS)
            use: [{
                loader: 'css-loader',
                options: {
                    minimize: options.optimizations.minimize || false
                }
            }]
        })
    };
};

// static assets required by bundles (e.g css files using url()) will be included in the build process
// and copied to the desired folder
rules.extractImages = function() {
    return {
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
    };
};

rules.extractFonts = function() {
    return {
        // fonts will live inside /assets/fonts/
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
            publicPath: '/fonts/',
            name: '[name].[ext]',
            outputPath: './fonts/',
            limit: 10000
        }
    };
};
