// Make sure we process any environment variables first
require('utils/environment');

// debug mode
exports.debug = process.env.DEBUG || false;

// development, staging or production
exports.environment = process.env.NODE_ENV || 'development';

exports.api = {
    host: process.env.API_HOST || 'localhost',
    port: process.env.API_PORT || 8443,
    tls: true,
    cors: ['*']
};

exports.auth = {
    expiresIn: '8h', // token validity for stateful authentication
    renewIn: '1h', // token validity for stateless renewable authentication
    signupIn: '30d', // token validity for the signup process
    passwordResetIn: '15m', // token validity for password reset
    loginIn: 7 * 24 * 60 * 60, // maximum renewable authentication validity in seconds
    version: 1 // the current token version
};

// url paths used by the noire server
exports.prefixes = {
    api: '/api',
    login: '/login',
    logout: '/logout',
    renew: '/renew',
    signup: '/signup',
    register: '/register',
    passwordReset: '/password-reset',
    passwordUpdate: '/password-update',
    profile: '/profile'
};

// node tls options object, check
// https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
exports.tls = {
    key: './certs/key.pem',
    cert: './certs/cert.pem'
};

/// noire pagination plugin
exports.pagination = {
    include: ['/api/role', '/api/user', '/api/contact']
    // include: ['*'],
    // exclude: []
};

// noire mailer smtp server settings
exports.smtp = {
    host: 'smtp.mailtrap.io',
    port: 2525,
    test: false
};

// noire server email settings
exports.mail = {
    templates: 'templates',
    compile: '**/*.hbs',
    address: {
        signup: '"<Academia de Código_>" <helloworld@academiadecodigo.org>',
        passwordReset: '"<Academia de Código_>" <helloworld@academiadecodigo.org>'
    },
    url: {
        signup: '/register',
        passwordReset: '/password-update'
    },
    maximumSignupRequests: 5
};
