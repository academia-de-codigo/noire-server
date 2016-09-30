'use strict';

var Fs = require('fs');

exports.ports = {
    web: 8080,
    api: 8081,
    admin: 8443,
};

exports.tls = {
    key: Fs.readFileSync('./certs/key.pem'),
    cert: Fs.readFileSync('./certs/cert.pem'),

    // Only necessary if using the client certificate authentication.
    requestCert: true,

    // Only necessary only if client is using the self-signed certificate.
    ca: []
};
