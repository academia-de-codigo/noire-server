const path = require('path');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const common = require('./webpack.common.js');
const Config = require(path.join(process.cwd(), 'lib/config/index'));

const viewsSrc = path.join(process.cwd(), Config.build.src, Config.build.views);
const viewsDst = path.join(process.cwd(), Config.build.dist, Config.build.views);

const internals = {
    plugins: {
        copyHbs: new CopyWebpackPlugin([{ from: viewsSrc, to: viewsDst }], {
            debug: Config.debug
        })
    }
};

module.exports = merge(common, {
    mode: 'development',
    plugins: [internals.plugins.copyHbs]
});
