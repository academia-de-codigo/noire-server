'use strict';

var Path = require('path');

module.exports = {

    development: {
        client: 'sqlite3',
        connection: {
            filename: Path.resolve(__dirname, 'db/dev.sqlite3')
        },
        pool: {
            min: 1,
            max: 4
        },
        migrations: {
            directory: './db/migrations'
        },
        seeds: {
            directory: './db/seeds/development'
        },
        useNullAsDefault: true,
        acquireConnectionTimeout: 500,
        debug: {
            query: true,
            tx: true,
            pool: false,
            client: false,
            bindings: false
        }
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
            directory: './db/migrations'
        },
        seeds: {
            directory: './db/seeds/staging'
        },
        acquireConnectionTimeout: 1000,
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
            directory: './db/migrations'
        },
        seeds: {
            directory: './db/seeds/prod'
        },
        acquireConnectionTimeout: 5000,
    }

};
