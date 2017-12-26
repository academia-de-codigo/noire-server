const Path = require('path');
const Fs = require('fs');
const WebpackConfig = require(Path.join(process.cwd(), 'webpack.config')).options;

// debug mode
exports.debug = process.env.DEBUG || false;

// development, staging or production
exports.environment = process.env.NODE_ENV || 'development';

exports.connections = {
    web: {
        host: process.env.WEB_HOST || 'localhost',
        port: process.env.WEB_PORT || 8080,
        enabled: false
    },
    api: {
        host: process.env.API_HOST || 'localhost',
        port: process.env.API_PORT || 8081,
        tls: true,
        enabled: true
    },
    webTls: {
        host: process.env.WEB_TLS_HOST || 'localhost',
        port: process.env.WEB_TLS_HOST || 8443,
        enabled: false
    }
};

exports.auth = {
    expiresIn: '8h',
};

exports.build = {
    src: WebpackConfig.paths.src.path,
    dist: WebpackConfig.paths.output.path
};

exports.prefixes = {
    login: '/login',
    logout: '/logout',
    admin: '/admin',
    api: '/api',
    home: '/home',
    scripts: '/js',
    images: '/img',
    styles: '/css',
    fonts: '/fonts',
    profile: '/profile',
    user: '/user/{id}',
    role: '/role/{id}'
};

exports.monitor = {
    debug: exports.debug,
    interval: 5000,
    format: 'DD-MM-YYYY HH:mm:SS X', // MomentJS format string
    path: 'log'
};

exports.cache = {
    views: false, // for dev only
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

// node tls options object, check
// https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
exports.tls = {
    key: Fs.readFileSync('./certs/key.pem'),
    cert: Fs.readFileSync('./certs/cert.pem'),
};

exports.redirect = {
    // Routes that should not be requested via HTTP, redirect them to our TLS connection
    tlsOnly: [exports.prefixes.admin, exports.prefixes.profile, exports.prefixes.user, exports.prefixes.role]
};
