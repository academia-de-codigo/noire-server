const Config = require('config'); // needs to be loaded first to source environent variables
const Knex = require('knex');
const KnexConfig = require('knexfile');
const Chalk = require('chalk');

(async function() {
    // creates a Knex instance configured according to the active environment
    const dbConfig = KnexConfig[Config.environment];
    const knex = Knex(dbConfig);

    console.log(
        `${Chalk.blue('Using environment')} ${Chalk.green(Config.environment)} : ${Chalk.magenta(
            JSON.stringify(dbConfig, null, 2)
        )}`
    );

    try {
        console.log(Chalk.blue('Migrating database to latest schema'));
        await knex.migrate.latest();

        console.log(Chalk.blue('Inserting database seeds'));
        await knex.seed.run();

        // postgres requires updating sequence ids after seeding
        if (dbConfig.client === 'postgresql') {
            console.log(Chalk.blue('Updating Postgres sequence IDs'));

            // get names of tables with id columns
            const tables = await knex('information_schema.columns')
                .select('tableName')
                .where('columnName', 'id');

            // reset serial sequence values
            await Promise.all(
                tables.map(value =>
                    knex.raw(
                        `SELECT setval(pg_get_serial_sequence('${
                            value.tableName
                        }', 'id'), coalesce(max(id), 0) + 1, false) FROM ${value.tableName};`
                    )
                )
            );

            console.log(Chalk.magenta('Postgres sequence IDs update complete'));
        }

        await knex.destroy();
        console.log(Chalk.magenta('Database reset complete'));
    } catch (err) {
        console.error(Chalk.red(err.stack));
        await knex.destroy();
        process.exit(1);
    }
})();
