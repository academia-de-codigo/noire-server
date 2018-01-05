/**
 * The home page routes
 * @module
 */
const Path = require('path');
const HomeCtrl = require(Path.join(process.cwd(), 'lib/modules/home/controllers/home'));

// GET /home
exports.get = {
    description: 'Returns the home page',
    handler: HomeCtrl.get
};
