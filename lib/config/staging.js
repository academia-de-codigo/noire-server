exports.api = {
    host: process.env.API_HOST || 'localhost',
    port: process.env.API_PORT || 8443,
    tls: true,
    cors: ['*.mydomain.com']
};

// noire pagination plugin
exports.pagination = {
    routes: {
        // include: ['*'],
        // exclude: []
        include: ['/api/role', '/api/user', '/api/contact']
    },
    baseUrl: 'https://www.mydomain.com'
};

// noire mailer smtp server settings
exports.smtp = {
    host: 'smtp.sendgrid.net',
    port: 587,
    test: false
};
