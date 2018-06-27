// Make sure we source existing JWT_SECRET environment variable
require('environment');

const Crypto = require('crypto');
const Auth = require('plugins/auth');
const Config = require('config');

// test user id
const TEST_ID = 0;

if (process.argv[2] === 'token') {
    getToken(process.argv[3], process.argv[4]);
} else if (process.argv[2] === 'secret') {
    createSecret();
}

// Randomly create a safe secret for usage in the server
function createSecret() {
    const secret = Crypto.randomBytes(256).toString('base64');
    console.log('Randomly generated secret for usage in JWT_SECRET environment variable:\n');
    console.log("export JWT_SECRET='" + secret + "'");
}

// Obtain a JWT auth token for test purposes
async function getToken(id = TEST_ID, version = Config.auth.version) {
    console.log(`JWT authentication token for test user with id ${id} and version ${version} is:`);
    console.log(await Auth.getToken({ id: id, version: version }));
}
