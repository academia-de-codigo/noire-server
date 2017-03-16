'use strict';

var Fs = require('fs');

// development, staging or production
exports.environment = process.env.NODE_ENV || 'development';

exports.debug = true;

exports.connections = {
    web: {
        host: process.env.WEB_HOST || 'localhost',
        port: process.env.WEB_PORT || 8080
    },
    api: {
        host: process.env.API_HOST || 'localhost',
        port: process.env.API_PORT || 8081,
    },
    webTls: {
        host: process.env.WEB_TLS_HOST || 'localhost',
        port: process.env.WEB_TLS_HOST || 8443,
    }
};

exports.auth = {
    expiresIn: '8h',
};

exports.prefixes = {
    admin: '/admin',
    account: '/account',
    api: '/api',
    scripts: '/js',
    images: '/img',
    styles: '/css',
    fonts: '/fonts'
};

exports.paths = {
    login: '/login',
    logout: '/logout',
    home: '/home'
};

exports.monitor = {
    debug: exports.debug,
    interval: 5000,
    format: 'DD-MM-YYYY HH:mm:SS X', // MomentJS format string
    path: 'log'
};

exports.cache = {
    views: {
        isCached: false // for dev only,
    },
    images: {
        expiresIn: 30 * 1000,
        privacy: 'private'
    },
    scripts: {
        expiresIn: 30 * 1000,
        privacy: 'private'
    },
    styles: {
        expiresIn: 30 * 1000,
        privacy: 'private'
    },
    fonts: {
        expiresIn: 30 * 1000,
        privacy: 'private'
    }
};

exports.logs = {
    size: '10M',
    interval: '5d',
    rotate: 5
};

exports.tls = {
    key: Fs.readFileSync('./certs/key.pem'),
    cert: Fs.readFileSync('./certs/cert.pem'),

    // Only necessary if using the client certificate authentication.
    requestCert: true,

    // Only necessary only if client is using the self-signed certificate.
    ca: []
};

exports.redirect = {
    // Routes that should not be requested via HTTP, redirect them to our TLS connection
    tlsOnly: [exports.prefixes.admin, exports.prefixes.account]
};
