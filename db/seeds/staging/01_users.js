exports.seed = function(knex, Promise) {
    return Promise.all([
        knex('users').insert({
            id: 1,
            active: true,
            name: 'Admin User',
            username: 'admin',
            email: 'admin@gmail.com',
            password: '$2a$10$VAVGq0cwRzsHWRLq9wexk.vE9AJlvE0IOoXt7Ru/J/hQVxgJz7ZG.', // admin
            avatar: '/img/avatar.png'
        }),
        knex('users').insert({
            id: 2,
            active: true,
            name: 'Test User',
            username: 'test',
            email: 'test@gmail.com',
            password: '$2a$10$t7TOeE4Xqwadu3rCzcqsPuFO60UkG0ertEHwEgaXkEY8tMQnJBgHe', // test
            avatar: '/img/avatar.png'
        }),
        knex('users').insert({
            id: 3,
            active: false,
            name: 'Guest User',
            username: 'guest',
            email: 'guest@gmail.com',
            password: '$2a$10$69gf1wrnvXhS6OArva47lut/I5ovAn7pdXSJfRNHHFZ0/9t/f8sXW', // guest
            avatar: '/img/avatar.png'
        })
    ])
        .then(() => {
            return Promise.all([
                knex('roles').insert({
                    id: 1,
                    name: 'admin',
                    description: 'administrator'
                }),
                knex('roles').insert({
                    id: 2,
                    name: 'user',
                    description: 'registered user'
                }),
                knex('roles').insert({
                    id: 3,
                    name: 'guest',
                    description: 'guest user'
                }),
                knex('roles').insert({
                    id: 4,
                    name: 'nousers',
                    description: 'testing'
                })
            ]);
        })
        .then(() => {
            return Promise.all([
                knex('users_roles').insert({
                    user_id: 1,
                    role_id: 1
                }),
                knex('users_roles').insert({
                    user_id: 1,
                    role_id: 2
                }),
                knex('users_roles').insert({
                    user_id: 1,
                    role_id: 3
                }),
                knex('users_roles').insert({
                    user_id: 2,
                    role_id: 2
                }),
                knex('users_roles').insert({
                    user_id: 2,
                    role_id: 3
                }),
                knex('users_roles').insert({
                    user_id: 3,
                    role_id: 3
                })
            ]);
        });
};
