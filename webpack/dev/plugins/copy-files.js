var Path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(options) {

    var paths = options.paths;

    var config = [{
        context: paths.src.path,
        from: Path.join(paths.src.assets, paths.assets.img),
        to: paths.output.img
    }, {
        context: paths.src.path,
        from: Path.join(paths.src.assets, paths.assets.fonts),
        to: paths.output.fonts
    }, {
        context: paths.src.path,
        from: Path.join(paths.src.views, paths.views.partials),
        to: Path.join(paths.output.views, paths.views.partials)
    }];

    return new CopyWebpackPlugin(config);
};
