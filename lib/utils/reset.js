const Knex = require('knex');
const KnexConfig = require('knexfile');
const Config = require('config');
const Chalk = require('chalk');

// creates a Knex instance configured according to the active environment
const dbConfig = KnexConfig[Config.environment];
const knex = Knex(dbConfig);

console.log(
    `${Chalk.blue('Using environment')} ${Chalk.green(Config.environment)} : ${Chalk.magenta(
        JSON.stringify(dbConfig, null, 2)
    )}`
);

(async function() {
    try {
        console.log(Chalk.blue('Migrating database to latest schema'));
        await knex.migrate.latest();
        console.log(Chalk.blue('Inserting database seeds'));
        await knex.seed.run();
        await knex.destroy();
        console.log(Chalk.magenta('Database reset complete'));
    } catch (err) {
        console.error(Chalk.red(err.stack));
        await knex.destroy();
        process.exit(1);
    }
})();
