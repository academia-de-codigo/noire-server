var Path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(options) {

    var paths = options.paths;

    var config = [{
        // copy all img assets from client/assets/img to dist/img
        context: paths.src.path,
        from: Path.join(paths.src.assets, paths.assets.img),
        to: paths.output.img
    }, {
        // copy all font assets from client/assets/fonts to dist/fonts
        context: paths.src.path,
        from: Path.join(paths.src.assets, paths.assets.fonts),
        to: paths.output.fonts
    }, {
        // copy all files in the client/assets folder to dist/ folder
        context: Path.join(paths.src.path, paths.src.assets),
        from: '*.*',
        to: Path.join(paths.output.path)
    }, {
        // copy all partials from client/views/partials to dist/views/partials
        context: paths.src.path,
        from: Path.join(paths.src.views, paths.views.partials),
        to: Path.join(paths.output.views, paths.views.partials)
    }];

    return new CopyWebpackPlugin(config);
};
