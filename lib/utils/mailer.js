/**
 * Mailer
 * @module
 */
const Fs = require('fs');
const Hoek = require('hoek');
const Util = require('util');
const Glob = require('glob');
const Path = require('path');
const NodeMailer = require('nodemailer');
const Handlebars = require('handlebars');
const Config = require('config');
const Logger = require('plugins/logger').getLogger();
const NSError = require('errors/nserror');
const HtmltoText = require('html-to-text');
const GetFiles = Util.promisify(Glob);
const ReadFile = Util.promisify(Fs.readFile);

const internals = {
    templates: {}
};

internals.createTransport = async function() {
    Hoek.assert(process.env.SMTP_USER && process.env.SMTP_PASS, 'smtp configuration not found');
    Hoek.assert(Hoek.deepEqual(internals.templates, {}) === false, 'email templates not found');

    try {
        const transporter = NodeMailer.createTransport({
            host: Config.smtp.host,
            port: Config.smtp.port,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            debug: Config.debug,
            logger: Logger,
            disableFileAccess: true
        });

        if (Config.smtp.test) {
            Logger.child({ host: Config.smtp.host, port: Config.smtp.port }).info('mailer test');
            await transporter.verify();
        }

        return transporter;
    } catch (error) {
        Logger.error(error);
        throw NSError.MAILER_ERROR('smtp transport error');
    }
};

internals.compileTemplates = async function() {
    const templatePath = Path.join(process.cwd(), Config.build.dist, Config.mail.templates);
    const templates = {};

    try {
        const files = await GetFiles(Config.mail.compile, { cwd: templatePath });

        for (let file of files) {
            const content = await ReadFile(Path.join(templatePath, file), 'utf8');
            const template = Path.join(Path.parse(file).dir, Path.parse(file).name);
            templates[template] = Handlebars.compile(content);

            Logger.child({ template }).debug('template');
        }

        return templates;
    } catch (error) {
        Logger.error(error);
        throw NSError.MAILER_ERROR('email configuration error');
    }
};

/**
 * Sends an email
 * @async
 * @param {Object} email information about the email
 * @param {string} email.from email from address
 * @param {string} email.to email to address
 * @param {string} email.subject the email subject
 * @param {string} email.html the html email payload
 * @param {string} email.text the text email payload
 */
exports.sendMail = async function(email) {
    Hoek.assert(internals.transporter, 'smtp transport not available');

    const { from, to, subject, template, context = {} } = email;
    const html = internals.templates[template](context);
    const text = HtmltoText.fromString(html);

    try {
        const info = await internals.transporter.sendMail({
            from,
            to,
            subject,
            html,
            text
        });

        Logger.child({ info }).debug('email has been delivered');
    } catch (error) {
        Logger.error(error);
        throw NSError.MAILER_ERROR();
    }
};

/**
 * Mailer initialization
 * @async
 */
exports.init = async function() {
    internals.templates = await internals.compileTemplates();
    internals.transporter = await internals.createTransport();
};
