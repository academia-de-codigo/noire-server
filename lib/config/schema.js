const Joi = require('@hapi/joi');

const internals = {};

internals.environments = ['development', 'staging', 'production', 'testing'];

internals.authSchema = Joi.object()
    .keys({
        renewIn: Joi.alternatives([Joi.number(), Joi.string()]).required(),
        signupIn: Joi.alternatives([Joi.number(), Joi.string()]).required(),
        passwordResetIn: Joi.alternatives([Joi.number(), Joi.string()]).required(),
        loginIn: Joi.number().required(),
        version: Joi.number().required()
    })
    .required();

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
    routes: Joi.object().keys({
        include: Joi.array().items(Joi.string().uri({ relativeOnly: true })),
        exclude: Joi.array().items(Joi.string().uri({ relativeOnly: true }))
    }),
    baseUrl: Joi.string().uri(),
    baseUri: Joi.string().uri()
};

internals.modelsSchema = {
    path: Joi.string().uri({ relativeOnly: true }),
    modules: Joi.array().items(Joi.string())
};

internals.smtpSchema = Joi.object()
    .keys({
        host: Joi.string()
            .hostname()
            .required(),
        port: Joi.number()
            .port()
            .required(),
        test: Joi.boolean().required()
    })
    .required();

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
        .valid(...internals.environments)
        .required(),
    api: internals.apiSchema,
    auth: internals.authSchema,
    prefixes: Joi.object().keys(internals.prefixesSchema(internals.prefixes)),
    models: Joi.object().keys(internals.modelsSchema),
    tls: Joi.object().keys(internals.tlsSchema),
    pagination: Joi.object().keys(internals.paginationSchema),
    smtp: internals.smtpSchema,
    mail: Joi.object().keys(internals.mailSchema)
};

module.exports = Joi.object().keys(internals.schema);
