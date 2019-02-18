// Make sure we process any environment variables first
require('environment');

// development, staging, testing or production
const environment = process.env.NODE_ENV || 'development';

const configMappings = {
    dev: 'dev',
    development: 'dev',
    prod: 'prod',
    production: 'prod',
    staging: 'staging',
    test: 'test',
    testing: 'test'
};

const common = require('config/common');
const envSpecific = require(`config/${configMappings[environment]}`);

module.exports = {...common, ...envSpecific};