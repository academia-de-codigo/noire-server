const path = require('path');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const htmlMinifier = require('html-minifier');
const common = require('./webpack.common.js');
const Config = require(path.join(process.cwd(), 'lib/config/index'));

const srcPath = path.join(process.cwd(), Config.build.src);
const distPath = path.join(process.cwd(), Config.build.dist);
const viewsSrc = path.join(srcPath, Config.build.views);
const viewsDst = path.join(distPath, Config.build.views);

const hbAttrWrapOpen = /\{\{#[^}]+\}\}/;
const hbAttrWrapClose = /\{\{\/[^}]+\}\}/;
const hbAttrWrapPair = [hbAttrWrapOpen, hbAttrWrapClose];

const internals = {
    plugins: {
        copyHbs: new CopyWebpackPlugin(
            [
                {
                    from: viewsSrc,
                    to: viewsDst,
                    transform: function(fileContent) {
                        return htmlMinifier.minify(fileContent.toString(), {
                            removeComments: true,
                            collapseWhitespace: true,
                            customAttrSurround: [hbAttrWrapPair]
                        });
                    }
                }
            ],
            {
                debug: Config.debug
            }
        )
    }
};

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: false,
                uglifyOptions: {
                    compress: {
                        ie8: false,
                        unused: true,
                        dead_code: true
                    },
                    output: {
                        comments: false
                    }
                },
                exclude: [/\.min\.js$/gi]
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: { discardComments: { removeAll: true } }
            })
        ]
    },
    plugins: [internals.plugins.copyHbs]
});
