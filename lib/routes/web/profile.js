'use strict';

var ProfileCtrl = require('../../controllers/web/profile');

// GET /home
exports.get = {
    description: 'Returns the user profile page',
    auth: {
        mode: 'try'
    },
    handler: ProfileCtrl.get
};
