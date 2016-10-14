'use strict';

var Fs = require('fs');

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
        host: process.env.ADMIN_HOST || 'localhost',
        port: process.env.ADMIN_PORT || 8443,
    }
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
    home: '/home'
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

exports.tls = {
    key: Fs.readFileSync('./certs/key.pem'),
    cert: Fs.readFileSync('./certs/cert.pem'),

    // Only necessary if using the client certificate authentication.
    requestCert: true,

    // Only necessary only if client is using the self-signed certificate.
    ca: []
};
