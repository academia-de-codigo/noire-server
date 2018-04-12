/**
 * The home page routes
 * @module
 */
const HomeCtrl = require('modules/home/controllers/web/home');

// GET /home
exports.get = {
    description: 'Returns the home page',
    handler: HomeCtrl.get
};
