var UglifyJsPlugin = require('webpack').optimize.UglifyJsPlugin;

module.exports = function(options) {

    var config = {
        beautify: options.optimizations.beautify || false,
        mangle: {
            screw_ie8: true,
            keep_fnames: true
        },
        compress: {
            screw_ie8: true
        },
        comments: false
    };

    return new UglifyJsPlugin(config);
};
