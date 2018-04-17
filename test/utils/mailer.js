const Lab = require('lab');
const Sinon = require('sinon');
const NodeMailer = require('nodemailer');
const Logger = require('test/fixtures/logger-plugin');
const Mock = require('mock-require');
const Handlebars = require('handlebars');
const Config = require('config');
const NSError = require('errors/nserror');

const { after, afterEach, before, beforeEach, describe, expect, it } = (exports.lab = Lab.script());

describe('Utils: mailer', () => {
    let mailConfig, smtpConfig;
    let Mailer;
    let nodeMailerStub;

    before(() => {
        mailConfig = Config.mail;
        smtpConfig = Config.smtp;

        Mock('plugins/logger', Logger);
        Mailer = Mock.reRequire('utils/mailer');
    });

    after(() => {
        Config.mail = mailConfig;
        Config.smtp = smtpConfig;

        Mock.stopAll();
    });

    beforeEach(() => {
        process.env.SMTP_USER = 'user';
        process.env.SMTP_PASS = 'pass';

        Config.mail = {
            templates: 'test/fixtures/email-templates',
            compile: '**/*.hbs'
        };

        Config.smtp = {
            test: false
        };

        nodeMailerStub = Sinon.stub(NodeMailer, 'createTransport').returns({
            sendMail: Sinon.stub().resolves(),
            verify: Sinon.stub().resolves()
        });
    });

    afterEach(() => {
        nodeMailerStub.restore();
    });

    it('does not initialize mailer without smtp configuration', async () => {
        // setup
        delete process.env.SMTP_USER;
        delete process.env.SMTP_PASS;

        // verify
        await expect(Mailer.init()).to.reject('smtp configuration not found');
    });

    it('does not initialize mailer if template directory not found', async () => {
        // setup
        Config.mail.templates = 'invalid';

        // verify
        await expect(Mailer.init()).to.reject('email templates not found');
    });

    it('handles template compilation errors', async flags => {
        // cleanup
        flags.onCleanup = function() {
            Handlebars.compile.restore();
        };

        // setup
        Sinon.stub(Handlebars, 'compile').throws();

        // verify
        await expect(Mailer.init()).to.reject('email configuration error');
    });

    it('handles smtp transport creation error', async () => {
        // setup
        NodeMailer.createTransport.restore();
        Sinon.stub(NodeMailer, 'createTransport').throws();

        await expect(Mailer.init()).to.reject(Error, 'smtp transport error');
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
        await Mailer.init();

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
        await Mailer.init();

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
        await expect(Mailer.init()).to.reject('smtp transport error');
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
        await Mailer.init();

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
        await Mailer.init();

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
        await Mailer.init();

        // exercise and verify
        await expect(Mailer.sendMail({ template: 'template1' })).to.reject(
            Error,
            NSError.MAILER_ERROR().message
        );
    });
});
