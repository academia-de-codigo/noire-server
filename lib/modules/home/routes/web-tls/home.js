/**
 * The home page routes
 * @module
 */
const HomeCtrl = require('modules/home/controllers/home');

// GET /home
exports.get = {
    description: 'Returns the home page',
    auth: {
        mode: 'try'
    },
    handler: HomeCtrl.get
};
