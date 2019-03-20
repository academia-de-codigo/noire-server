exports.seed = function(knex) {
    return knex.raw('PRAGMA foreign_keys=ON');
};
