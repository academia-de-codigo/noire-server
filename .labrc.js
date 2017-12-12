module.exports = {
    verbose: true,
    debug: true,
    coverage: true,
    threshold: 90,
    lint: true,
    assert: 'code',
    'coverage-path': 'lib',
    'coverage-exclude': 'config',
    paths: [
        'test/errors',
        'test/utils',
        'test/models',
        'test/plugins/route-errors.js',
        'test/plugins/assets.js',
        'test/plugins/views.js',
        'test/plugins/db.js',
        'test/plugins/repository.js',
        'test/plugins/redirect.js',
        'test/plugins/auth.js',
        'test/plugins/csrf.js',
        'test/modules/home/controllers',
        'test/modules/authorization/controllers/web/profile.js',
        'test/modules/authorization/services'
    ],
	globals: '__core-js_shared__' // https://github.com/tgriesser/knex/issues/1720
};
