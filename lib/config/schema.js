const Joi = require('joi');

const internals = {};

internals.environments = ['development', 'staging', 'production', 'testing'];

internals.prefixes = [
    'api',
    'login',
    'logout',
    'renew',
    'signup',
    'register',
    'passwordReset',
    'passwordUpdate',
    'profile'
];

internals.getFileExtensionRegex = function(...filetypes) {
    const regex = new RegExp(`.([0-9a-z]+)(?=[?#])|(.)(?:[ ${filetypes.join()} ]+)$`);
    const error = `file must be of type ${filetypes.join()}`;
    return [regex, error];
};

internals.apiSchema = Joi.object().keys({
    host: Joi.string().hostname(),
    port: Joi.number().port(),
    tls: Joi.boolean(),
    cors: Joi.array()
});

internals.tlsSchema = {
    key: Joi.string().regex(...internals.getFileExtensionRegex('pem')),
    cert: Joi.string().regex(...internals.getFileExtensionRegex('pem'))
};

internals.prefixesSchema = function(prefixes) {
    const result = {};
    return prefixes.forEach(key => (result[key] = Joi.string().uri({ relativeOnly: true })));
};

internals.paginationSchema = {
    include: Joi.array().items(Joi.string().uri({ relativeOnly: true })),
    exclude: Joi.array().items(Joi.string().uri({ relativeOnly: true }))
};

internals.smtpSchema = Joi.object()
    .keys({
        host: Joi.string().hostname(),
        port: Joi.number().port(),
        test: Joi.boolean()
    })
    .requiredKeys('host', 'port', 'test');

internals.mailSchema = {
    templates: Joi.string().uri({ relativeOnly: true }),
    compile: Joi.string().regex(...internals.getFileExtensionRegex('hbs')),
    address: Joi.object().keys({
        signup: Joi.string(),
        passwordReset: Joi.string()
    }),
    url: Joi.object().keys({
        signup: Joi.string().uri({ relativeOnly: true }),
        passwordReset: Joi.string().uri({ relativeOnly: true })
    }),
    maximumSignupRequests: Joi.number().positive()
};

internals.schema = {
    debug: Joi.boolean().required(),
    environment: Joi.string()
        .valid(internals.environments)
        .required(),
    api: internals.apiSchema,
    auth: Joi.object().required(),
    prefixes: Joi.object().keys(internals.prefixesSchema(internals.prefixes)),
    tls: Joi.object().keys(internals.tlsSchema),
    pagination: Joi.object().keys(internals.paginationSchema),
    smtp: internals.smtpSchema,
    mail: Joi.object().keys(internals.mailSchema)
};

module.exports = Joi.object().keys(internals.schema);
