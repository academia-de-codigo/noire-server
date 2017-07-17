var HomeCtrl = require('../controllers/home');

// GET /home
exports.get = {
    description: 'Returns the home page',
    auth: {
        mode: 'try'
    },
    handler: HomeCtrl.get
};
