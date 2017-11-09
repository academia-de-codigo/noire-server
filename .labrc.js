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
        'test/plugins/views.js'
        // 'test/modules',
    ],
	globals: '__core-js_shared__' // https://github.com/tgriesser/knex/issues/1720
};
