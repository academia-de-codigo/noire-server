exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('user', function(table) {
            table.increments().primary();
            table.string('username');
            table.string('email');
            table.string('password');
            table.timestamps();
        }),
        knex.schema.createTable('role', function(table) {
            table.increments().primary();
            table.string('name');
            table.timestamps();
        }),
        knex.schema.createTable('user_role', function(table) {
            table.integer('user_id').unsigned().references('id').inTable('user');
            table.integer('role_id').unsigned().references('id').inTable('role');
            table.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('user'),
        knex.schema.dropTableIfExists('role'),
        knex.schema.dropTableIfExists('user_role')
    ]);
};
