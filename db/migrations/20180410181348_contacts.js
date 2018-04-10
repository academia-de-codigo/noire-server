exports.up = function(knex, Promise) {
    return knex.schema.createTable('contacts', function(table) {
        table.increments().primary();
        table.string('email');
        table.boolean('confirmed');
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('contacts');
};
