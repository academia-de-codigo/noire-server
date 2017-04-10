var Path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function(options) {

    var config = {
        filename: Path.join(options.paths.output.css, '[name].css')
    };

    return new ExtractTextPlugin(config);
};
