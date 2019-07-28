exports.api = {
    host: process.env.API_HOST || 'localhost',
    port: process.env.API_PORT || 8080,
    tls: false,
    cors: ['*']
};
