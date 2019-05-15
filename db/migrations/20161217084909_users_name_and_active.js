exports.up = function(knex) {
    return Promise.all([
        knex.schema.table('user', function(table) {
            table.string('name');
            table.boolean('active');
        })
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table('user', function(table) {
            table.dropColumn('name');
            table.dropColumn('active');
        })
    ]);
};
