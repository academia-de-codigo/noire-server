'use strict';

var AdminCtrl = require('../../controllers/web/admin');

exports.get = {
    description: 'Returns the admin section',
    auth: {
        scope: 'admin'
    },
    handler: AdminCtrl.get
};
