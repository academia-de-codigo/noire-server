var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function() {

    // TODO: make this configurable from outside
    var config = {
        filename: './css/[name].css'
    };

    return new ExtractTextPlugin(config);
};
