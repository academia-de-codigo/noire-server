var CopyWebpackPlugin = require('copy-webpack-plugin');
var Path = require('path');

module.exports = function(options) {

    var config = [{
        from: Path.join(options.BASE_PATH, options.src.path, options.src.assets),
        to: Path.join(options.BASE_PATH, options.dist.path)
    }];

    return new CopyWebpackPlugin(config);
};
