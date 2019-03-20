exports.seed = function(knex, Promise) {
    return knex('contacts')
        .del()
        .then(function() {
            return knex('contacts').insert([
                { id: 1, email: 'admin@gmail.com', confirmed: true, signup_requests: 0 },
                { id: 2, email: 'test@gmail.com', confirmed: true, signup_requests: 0 },
                { id: 3, email: 'contact@gmail.com', confirmed: false, signup_requests: 0 },
                { id: 4, email: 'spammer@gmail.com', confirmed: false, signup_requests: 20 }
            ]);
        });
};
