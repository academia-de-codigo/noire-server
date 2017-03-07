exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('resource', function(table) {
            table.increments().primary();
            table.string('name');
            table.timestamps();

        }),
        knex.schema.createTable('permission', function(table) {
            table.increments().primary();
            table.enu('action', ['create', 'read', 'update', 'delete']);
            table.integer('resource_id').unsigned().references('id').inTable('resource');
            table.timestamps();
        }),
        knex.schema.createTable('role_permission', function(table) {
            table.integer('role_id').unsigned().references('id').inTable('role');
            table.integer('permission_id').unsigned().references('id').inTable('permission');
            table.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('resource'),
        knex.schema.dropTableIfExists('permission'),
        knex.schema.dropTableIfExists('role_permission')
    ]);
};
