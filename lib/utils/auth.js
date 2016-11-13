'use strict';

var Crypto = require('crypto');
var Auth = require('../plugins/auth');

var TEST_ID = 0;

if (process.argv[2] === 'token') {

    getToken(process.argv[3]);

} else if (process.argv[2] === 'secret') {

    createSecret();

}

// Randomly create a safe secret for usage in the server
function createSecret() {
    var secret = Crypto.randomBytes(256).toString('base64');
    console.log('Randomly generated secret for usage in JWT_SECRET environment variable:\n');
    console.log('export JWT_SECRET=\'' + secret + '\'');
}

// Obtain a JWT token for the id 0 (test user)
function getToken() {
    var id = TEST_ID;
    console.log('JWT token for test id ' + id + ' is:');
    console.log(Auth.getToken(id, false));
}
