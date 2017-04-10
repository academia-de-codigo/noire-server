var Path = require('path');
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
                    minimize: options.optimizations ? options.optimizations.minimize : false
                }
            }]
        })
    };
};

// static assets required by bundles (e.g css files using url()) will be included in the build process
// and copied to the desired folder
rules.extractImages = function(options) {
    return {
        // pictures will live inside /assets/img/ folder
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
            publicPath: Path.join('..', '/'),
            name: '[name].[ext]',
            outputPath: Path.join(options.paths.output.img, '/'), // file-loader needs a trailling slash on the path (didnt find open issue)
            limit: 1024 // images smaller than 1MB will be imported as a data url (in base64)
        }
    };
};

rules.extractFonts = function(options) {
    return {
        // fonts will live inside /assets/fonts/
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
            publicPath: Path.join('..', '/'),
            name: '[name].[ext]',
            outputPath: Path.join(options.paths.output.fonts, '/'),
            limit: 1024
        }
    };
};
