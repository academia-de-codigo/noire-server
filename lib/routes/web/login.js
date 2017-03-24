// GET /login
exports.get = {
    description: 'Returns the login page',
    auth: false,
    handler: {
        view: {
            template: 'pages/login',
        }
    }
};
