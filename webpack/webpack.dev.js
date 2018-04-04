const path = require('path');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const common = require('./webpack.common.js');
const Config = require(path.join(process.cwd(), 'lib/config/index'));

const BUILD_DIR = path.join(process.cwd(), 'client/dist');
const SRC_DIR = path.join(process.cwd(), 'client/src');
const VIEWS_SRC_DIR = path.join(SRC_DIR, 'views');

const internals = {
    plugins: {
        copyHbs: new CopyWebpackPlugin(
            [{ from: VIEWS_SRC_DIR, to: path.join(BUILD_DIR, 'views') }],
            {
                debug: Config.debug
            }
        )
    }
};

module.exports = merge(common, {
    mode: 'development',
    plugins: [internals.plugins.copyHbs]
});
