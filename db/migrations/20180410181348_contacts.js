exports.up = function(knex) {
    return knex.schema.createTable('contacts', function(table) {
        table.increments().primary();
        table.string('email');
        table.boolean('confirmed');
        table.timestamps();
        table.integer('signup_requests').unsigned();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('contacts');
};
