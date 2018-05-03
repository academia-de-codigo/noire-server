const Knex = require('knex');
const KnexConfig = require('knexfile');
const Config = require('config');

// creates a Knex instance configured according to the active environment
const knex = Knex(KnexConfig[Config.environment]);

(async function() {
    try {
        await knex.migrate.latest();
        await knex.seed.run();
        await knex.destroy();
    } catch (err) {
        console.error(err);
        await knex.destroy();
        process.exit(1);
    }
})();
