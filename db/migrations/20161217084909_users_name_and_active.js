exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('user', function(table) {
            table.string('name');
            table.boolean('active');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('user', function(table) {
            table.dropColumn('name');
            table.dropColumn('active');
        })
    ]);
};
