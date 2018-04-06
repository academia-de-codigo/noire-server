const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const Config = require(path.join(process.cwd(), 'lib/config/index'));

const srcPath = path.join(process.cwd(), Config.build.src);
const distPath = path.join(process.cwd(), Config.build.dist);
const scriptSrc = path.join(srcPath, Config.build.scripts);
const imagesSrc = path.join(srcPath, Config.build.assets, Config.build.images);
const imagesDst = path.join(distPath, Config.build.images);
const fontsSrc = path.join(srcPath, Config.build.assets, Config.build.fonts);
const fontsDst = path.join(distPath, Config.build.fonts);
const favIconSrc = path.join(srcPath, Config.build.assets, 'favicon.ico');

const internals = {
    entries: {},
    plugins: {
        clean: new CleanWebpackPlugin([distPath], {
            root: process.cwd()
        }),
        jquery: new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        copyAssets: new CopyWebpackPlugin(
            [
                { from: imagesSrc, to: imagesDst },
                { from: fontsSrc, to: fontsDst },
                { from: favIconSrc, to: distPath }
            ],
            {
                debug: Config.debug
            }
        ),
        miniCss: new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: '[id].css'
        }),
        progress: new SimpleProgressWebpackPlugin({
            format: 'compact'
        })
    }
};

glob.sync(`${scriptSrc}/**/*.js`).forEach(entry => {
    internals.entries[
        path.join(path.parse(path.relative(scriptSrc, entry)).dir, path.parse(entry).name)
    ] = entry;
});

module.exports = {
    entry: internals.entries,
    output: {
        path: distPath,
        filename: 'js/[name].js'
    },
    stats: {
        modules: true,
        chunkModules: true,
        colors: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                include: [/client/],
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 100000
                    }
                }
            }
        ]
    },
    plugins: [
        internals.plugins.jquery,
        internals.plugins.clean,
        internals.plugins.copyAssets,
        internals.plugins.miniCss,
        internals.plugins.progress
    ]
};
