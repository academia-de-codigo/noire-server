const Path = require('path');
const knexSnakeCaseMappers = require('objection').knexSnakeCaseMappers;

module.exports = {
    testing: {
        client: 'sqlite3',
        connection: ':memory:',
        migrations: {
            directory: __dirname + '/db/migrations'
        },
        seeds: {
            directory: __dirname + '/db/seeds/testing'
        },
        useNullAsDefault: true,
        ...knexSnakeCaseMappers()
    },

    development: {
        client: 'sqlite3',
        connection: {
            filename: Path.resolve(__dirname, 'db/dev.sqlite3')
        },
        pool: {
            min: 1,
            max: 2
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
            bindings: true
        },
        ...knexSnakeCaseMappers()
    },

    staging: {
        client: 'postgresql',
        connection: {
            host: '127.0.0.1',
            database: 'noire',
            user: 'noire',
            password: 'noire'
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
        debug: {
            query: true,
            tx: true,
            pool: false,
            client: false,
            bindings: true
        },
        ...knexSnakeCaseMappers()
    },

    production: {
        client: 'postgresql',
        connection: {
            host: '127.0.0.1',
            database: 'noire',
            user: 'noire',
            password: 'noire'
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
        ...knexSnakeCaseMappers()
    }
};
