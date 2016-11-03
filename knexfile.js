'use strict';

var Path = require('path');

module.exports = {

    development: {
        client: 'sqlite3',
        connection: {
            filename: Path.resolve(__dirname, 'db/dev.sqlite3')
        },
        migrations: {
            directory: './db/migrations'
        },
        seeds: {
            directory: '.db/seeds/development'
        },
        useNullAsDefault: true,
        acquireConnectionTimeout: 500,
        debug: true
    },

    staging: {
        client: 'postgresql',
        connection: {
            host: '127.0.0.1',
            database: 'hapi_starter',
            user: 'hapi_starter',
            password: 'hapi_starter'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'migrations'
        },
        seeds: {
            directory: '.db/seeds/staging'
        },
        acquireConnectionTimeout: 1000,
        debug: false
    },

    production: {
        client: 'postgresql',
        connection: {
            host: '',
            database: '',
            user: '',
            password: ''
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'migrations'
        },
        seeds: {
            directory: '.db/seeds/prod'
        },
        acquireConnectionTimeout: 5000,
        debug: false
    }

};
