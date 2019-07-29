const Lab = require('@hapi/lab');
const Hapi = require('@hapi/hapi');
const Sinon = require('sinon');
const NodeMailer = require('nodemailer');
const Logger = require('test/fixtures/logger-plugin');
const Mock = require('mock-require');
const Handlebars = require('handlebars');
const NSError = require('errors/nserror');

const { after, afterEach, before, beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Plugin: mailer', () => {
    let server, mailConfig, smtpConfig, buildConfig;
    let Config, Mailer;
    let nodeMailerStub;

    before(() => {
        Config = require('config');
        mailConfig = Config.mail;
        smtpConfig = Config.smtp;
        buildConfig = Config.build;

        Mock('plugins/logger', Logger);
        Mailer = Mock.reRequire('plugins/mailer');
    });

    after(() => {
        Config.mail = mailConfig;
        Config.smtp = smtpConfig;
        Config.build = buildConfig;

        Mock.stopAll();
    });

    beforeEach(() => {
        process.env.SMTP_USER = 'user';
        process.env.SMTP_PASS = 'pass';

        Config.build = {
            dist: 'test'
        };

        Config.mail = {
            templates: 'test/fixtures/templates',
            compile: '**/*.hbs'
        };

        Config.smtp = {
            test: false
        };

        nodeMailerStub = Sinon.stub(NodeMailer, 'createTransport').returns({
            sendMail: Sinon.stub().resolves(),
            verify: Sinon.stub().resolves()
        });

        server = Hapi.server();
        server.register(Logger);
    });

    afterEach(() => {
        nodeMailerStub.restore();
    });

    it('does not register mailer without smtp configuration', async () => {
        // setup
        delete process.env.SMTP_USER;
        delete process.env.SMTP_PASS;

        // verify
        await expect(server.register(Mailer)).to.reject('smtp configuration not found');
    });

    it('does not initialize mailer if template directory not found', async () => {
        // setup
        Config.mail.templates = 'invalid';

        // verify
        await expect(server.register(Mailer)).to.reject('email templates not found');
    });

    it('handles template compilation errors', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Handlebars.compile.restore();
        };

        // setup
        Sinon.stub(Handlebars, 'compile').throws();

        // verify
        await expect(server.register(Mailer)).to.reject('email configuration error');
    });

    it('handles smtp transport creation error', async () => {
        // setup
        NodeMailer.createTransport.restore();
        Sinon.stub(NodeMailer, 'createTransport').throws();

        await expect(server.register(Mailer)).to.reject(Error, 'smtp transport error');
    });

    it('verifies transport if set in configuration', async () => {
        // setup
        const verifyStub = Sinon.stub().resolves();
        Config.smtp.test = true;

        NodeMailer.createTransport.restore();
        Sinon.stub(NodeMailer, 'createTransport').returns({
            verify: verifyStub,
            sendMail: Sinon.stub()
        });

        // exercise
        await server.register(Mailer);

        // verify
        expect(verifyStub.calledOnce).to.be.true();
    });

    it('does not verify transport if not set in configuration', async () => {
        // setup
        const verifyStub = Sinon.stub().resolves();

        NodeMailer.createTransport.restore();
        Sinon.stub(NodeMailer, 'createTransport').returns({
            verify: verifyStub,
            sendMail: Sinon.stub()
        });

        // exercise
        await server.register(Mailer);

        // verify
        expect(verifyStub.called).to.be.false();
    });

    it('handles transport verification failure', async () => {
        // setup
        const verifyStub = Sinon.stub().rejects();
        Config.smtp.test = true;
        NodeMailer.createTransport.restore();
        Sinon.stub(NodeMailer, 'createTransport').returns({
            verify: verifyStub,
            sendMail: Sinon.stub()
        });

        // verify
        await expect(server.register(Mailer)).to.reject('smtp transport error');
    });

    it('sends email from template', async () => {
        // setup
        const email = {
            from: 'admin@gmail.com',
            to: 'test@test.com',
            subject: 'an email',
            template: 'template1',
            context: {
                var1: 'some context variable',
                var2: 'another context variable'
            }
        };
        const sendMailStub = Sinon.stub().resolves();
        NodeMailer.createTransport.restore();
        Sinon.stub(NodeMailer, 'createTransport').returns({
            verify: Sinon.stub(),
            sendMail: sendMailStub
        });
        await server.register(Mailer);

        // exercise
        await Mailer.sendMail(email);

        // verify
        expect(sendMailStub.calledOnce).to.be.true();
        expect(sendMailStub.getCall(0).args[0].from).to.equals(email.from);
        expect(sendMailStub.getCall(0).args[0].to).to.equals(email.to);
        expect(sendMailStub.getCall(0).args[0].subject).to.equals(email.subject);
        expect(sendMailStub.getCall(0).args[0].html).to.be.a.string();
        expect(sendMailStub.getCall(0).args[0].html).to.contains(email.context.var1);
        expect(sendMailStub.getCall(0).args[0].html).to.not.contains(email.context.var2);
        expect(sendMailStub.getCall(0).args[0].text).to.be.a.string();
        expect(sendMailStub.getCall(0).args[0].text).to.contains(email.context.var1);
        expect(sendMailStub.getCall(0).args[0].text).to.not.contains(email.context.var2);
    });

    it('handles send email when transport is not available', async () => {
        // setup
        NodeMailer.createTransport.restore();
        Sinon.stub(NodeMailer, 'createTransport').returns(undefined);
        await server.register(Mailer);

        // exercise and verify
        await expect(Mailer.sendMail()).to.reject('smtp transport not available');
    });

    it('handles failures sending email', async () => {
        // setup
        NodeMailer.createTransport.restore();
        Sinon.stub(NodeMailer, 'createTransport').returns({
            verify: Sinon.stub(),
            sendMail: Sinon.stub().rejects()
        });
        await server.register(Mailer);

        // exercise and verify
        await expect(Mailer.sendMail({ template: 'template1' })).to.reject(
            Error,
            NSError.MAILER_ERROR().message
        );
    });
});
