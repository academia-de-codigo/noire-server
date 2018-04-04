const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Config = require(path.join(process.cwd(), 'lib/config/index'));

const BUILD_DIR = path.join(process.cwd(), 'client/dist');
const SRC_DIR = path.join(process.cwd(), 'client/src');
const JS_SRC_DIR = path.join(SRC_DIR, 'js/pages');
const IMAGES_SRC_DIR = path.join(SRC_DIR, 'assets/img');
const FONTS_SRC_DIR = path.join(SRC_DIR, 'assets/fonts');

const internals = {
    entries: {},
    plugins: {
        clean: new CleanWebpackPlugin([BUILD_DIR], {
            root: process.cwd()
        }),
        jquery: new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        copyAssets: new CopyWebpackPlugin(
            [
                { from: IMAGES_SRC_DIR, to: path.join(BUILD_DIR, 'img') },
                { from: FONTS_SRC_DIR, to: path.join(BUILD_DIR, 'fonts') },
                { from: path.join(SRC_DIR, 'assets', 'favicon.ico'), to: BUILD_DIR }
            ],
            {
                debug: Config.debug
            }
        ),
        miniCss: new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: '[id].css'
        })
    }
};

glob.sync(`${JS_SRC_DIR}/**/*.js`).forEach(entry => {
    internals.entries[
        path.parse(path.relative(JS_SRC_DIR, entry)).dir + '/' + path.parse(entry).name
    ] = entry;
});

module.exports = {
    entry: internals.entries,
    output: {
        path: BUILD_DIR,
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
        internals.plugins.miniCss
    ]
};
