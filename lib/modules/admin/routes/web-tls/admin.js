/**
 * The admin page routes
 * @module
 */
const AdminCtrl = require('modules/admin/controllers/web/admin');

// GET /admin
exports.get = {
    description: 'Returns the admin page',
    handler: AdminCtrl.get,
    auth: {
        scope: 'admin'
    }
};
