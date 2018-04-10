exports.seed = function(knex, Promise) {
    return knex('contacts')
        .del()
        .then(function() {
            return knex('contacts').insert([
                { id: 1, email: 'admin@gmail.com', confirmed: true },
                { id: 2, email: 'test@gmail.com', confirmed: true }
            ]);
        });
};
