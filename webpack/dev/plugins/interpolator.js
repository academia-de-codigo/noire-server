var Path = require('path');
var LayoutPlugin = require('layout-webpack-plugin');

module.exports = function(options) {

    var paths = options.paths;

    var config = {
        layout: Path.join(paths.src.path, paths.src.views, paths.views.layout),
        pages: Path.join(paths.src.path, paths.src.views, paths.views.pages),
        output: Path.join(paths.output.views, paths.views.pages),
        transforms: [{
            replace: '{{{ content }}}',
            withFile: '[page]'
        }, {
            replace: '{{ jsBundleTag }}',
            with: '[jsBundleTag]'
        }, {
            replace: '{{ cssBundleTag }}',
            with: '[cssBundleTag]'
        }]
    };

    return new LayoutPlugin(config);
};
