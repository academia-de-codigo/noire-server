var Webpack = require('webpack');
var CommonsChunkPlugin = Webpack.optimize.CommonsChunkPlugin;

module.exports = function(options) {

    var config = {
        name: options.names.commons || 'commons'
    };

    return new CommonsChunkPlugin(config);

};
