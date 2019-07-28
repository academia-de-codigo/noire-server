const Lab = require('@hapi/lab');
const Mock = require('mock-require');

const { before, describe, expect, it, after } = (exports.lab = Lab.script());

describe('Config', () => {

    let env, config;

    before(() => {
        env = process.env.NODE_ENV;

        Mock('config/common', { common: true, env: 'common' });
        Mock('config/dev', { env: 'dev' });
        Mock('config/prod', { env: 'prod' });
        Mock('config/test', { env: 'test' });
    });

    after(() => {
        process.env.NODE_ENV = env;

        Mock.stopAll();
        delete require.cache[require.resolve('config')];
    });

    it('requires common config file', () => {
        //setup
        process.env.NODE_ENV = 'dev';

        //exercise
        config = Mock.reRequire('config');

        //verify
        expect(config).to.be.an.object();
        expect(config.common).to.be.a.boolean();
        expect(config.common).to.equals(true);
    });

    it('requires env config file', () => {
        //setup
        process.env.NODE_ENV = 'prod';

        //exercise
        config = Mock.reRequire('config');

        //verify
        expect(config.env).to.be.a.string();
        expect(config.env).to.equals('prod');
    });

    it('overrides common config only if same config appears in env specific file', () => {
        //setup
        process.env.NODE_ENV = 'dev';

        //exercise
        config = Mock.reRequire('config');

        //verify
        expect(config).to.be.an.object();
        expect(config.common).to.be.a.boolean();
        expect(config.common).to.equals(true);
        expect(config.env).to.be.a.string();
        expect(config.env).to.not.equals('common');
        expect(config.env).to.equals('dev');
    });

    it('requires default env config file if no env specified', () => {
        //setup
        process.env.NODE_ENV = '';

        //exercise
        config = Mock.reRequire('config');

        //verify
        expect(config.env).to.be.a.string();
        expect(config.env).to.equals('dev');
    });
});
