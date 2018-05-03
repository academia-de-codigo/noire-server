const DotEnv = require('dotenv');

// source the contents of .env to environment variables
const env = DotEnv.config();

// do nothing if .env file is missing
if (env.error && env.error.errno === -2) {
    return;
}

// exit with error if unable to parse .env file
if (env.error) {
    console.error('Error parsing environment file: ', env.error.message);
    process.exit(1);
}
