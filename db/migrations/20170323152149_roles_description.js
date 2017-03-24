exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('role', function(table) {
            table.string('description');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('role', function(table) {
            table.dropColumn('description');
        })
    ]);
};
