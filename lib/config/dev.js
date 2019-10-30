exports.api = {
    host: process.env.API_HOST || 'localhost',
    port: process.env.API_PORT || 8080,
    tls: false,
    cors: ['*']
};

exports.auth = {
    renewIn: '5m', // token validity for stateless renewable authentication
    signupIn: '30d', // token validity for the signup process
    passwordResetIn: '15m', // token validity for password reset
    loginIn: 7 * 24 * 60 * 60, // maximum renewable authentication validity in seconds
    version: 1 // the current token version
};

